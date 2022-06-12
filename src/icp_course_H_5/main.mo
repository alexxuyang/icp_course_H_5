import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Error "mo:base/Error";
import Principal "mo:base/Principal";
import Cycles "mo:base/ExperimentalCycles";

import SHA256 "mo:sha256/SHA256";

import IC "./ic";
import Types "./types";

actor class cycle_manager(m: Nat, list: [Types.Owner]) = self {
  public type Owner = Types.Owner;
  public type Canister = Types.Canister;
  public type ID = Types.ID;
  public type Proposal = Types.Proposal;
  public type ProposalType = Types.ProposalType;
  public type CanisterStatus = Types.CanisterStatus;

  var proposals : Buffer.Buffer<Proposal> = Buffer.Buffer<Proposal>(0);
  var ownedCanisters : [Canister] = [];

  // map of ( Canister - Bool), value is true means this canister need multi-sig managed
  var canisterPermissions : HashMap.HashMap<Canister, Bool> = HashMap.HashMap<Canister, Bool>(0, func(x: Canister,y: Canister) {x==y}, Principal.hash);
  var canisterStatus : HashMap.HashMap<Canister, CanisterStatus> = HashMap.HashMap<Canister, CanisterStatus>(0, func(x: Canister,y: Canister) {x==y}, Principal.hash);
  var ownerList : [Owner] = list;

  var M : Nat = m;
  var N : Nat = ownerList.size();

  public func greet(name : Text) : async Text {
    return "Hello, " # name # "!";
  };

  public shared (msg) func propose(ptype: ProposalType, canister_id: ?Canister, wasm_code: ?Blob) : async Proposal {
    // caller should be one of the owners
    assert(owner_check(msg.caller));

    // only the canister that (permission = false) can add permission
    if (ptype == #addPermission) {
      assert(canisterPermissions.get(Option.unwrap(canister_id)) == ?false);
    };

    // only the canister that (permission = true) can remove permission
    if (ptype == #removePermission) {
      assert(canisterPermissions.get(Option.unwrap(canister_id)) == ?true);
    };

    if (ptype == #addMember) {
      assert(Option.isSome(canister_id));
    };

    var wasm_code_hash : [Nat8] = [];

    if (ptype == #installCode) {
      assert(Option.isSome(wasm_code));
      wasm_code_hash := SHA256.sha256(Blob.toArray(Option.unwrap(wasm_code)));
    };

    if (ptype == #upgradeCode) {
      assert(Option.isSome(wasm_code));
      wasm_code_hash := SHA256.sha256(Blob.toArray(Option.unwrap(wasm_code)));
    };

    if (ptype != #createCanister) {
      assert(Option.isSome(canister_id));
    };

    if (ptype != #addMember) {
      switch (canister_id) {
        case (?id) assert(canister_check(id));
        case (null) {};
      };
    };

    let proposal : Proposal = {
      id = proposals.size();
      wasm_code;
			wasm_code_hash;
      ptype;
      proposer = msg.caller;
      canister_id; // is Principal ID when add memeber
      approvers = [];
      refusers = [];
      finished = false;
    };

    Debug.print(debug_show(msg.caller, "PROPOSED", proposal.ptype, "Proposal ID", proposal.id));
    Debug.print(debug_show());

    proposals.add(proposal);

    proposal
  };

  func is_canister_ops_need_no_permission(p: Proposal) : Bool {
    Option.isSome(p.canister_id) and canisterPermissions.get(Option.unwrap(p.canister_id)) == ?false
      and p.ptype != #addPermission and p.ptype != #removePermission and p.ptype != #createCanister
  };

  public shared (msg) func refuse(id: ID) : async Proposal {
    // caller should be one of the owners
    assert(owner_check(msg.caller));

    assert(id + 1 <= proposals.size());

    var proposal = proposals.get(id);

    assert(not proposal.finished);

    assert(no_action_check(proposal, msg.caller));

    proposal := Types.add_refuser(proposal, msg.caller);

    if (proposal.refusers.size() + M > N or is_canister_ops_need_no_permission(proposal)) {
      proposal := Types.finish_proposer(proposal);
    };

    Debug.print(debug_show(msg.caller, "REFUSED", proposal.ptype, "Proposal ID", proposal.id, "Executed", proposal.finished));
    Debug.print(debug_show());

    proposals.put(id, proposal);
    proposals.get(id)
  };

  public shared (msg) func approve(id: ID) : async Proposal {
    Debug.print(debug_show(msg.caller));
    
    // caller should be one of the owners
    assert(owner_check(msg.caller));

    assert(id + 1 <= proposals.size());

    var proposal = proposals.get(id);

    assert(not proposal.finished);

    assert(no_action_check(proposal, msg.caller));

    proposal := Types.add_approver(proposal, msg.caller);

    if (proposal.approvers.size() == M or is_canister_ops_need_no_permission(proposal)) {
      let ic : IC.Self = actor("aaaaa-aa");

      switch (proposal.ptype) {
        case (#addPermission) {
          canisterPermissions.put(Option.unwrap(proposal.canister_id), true);
        };
        case (#removePermission) {
          canisterPermissions.put(Option.unwrap(proposal.canister_id), false);
        };
        case (#createCanister) {
          let settings : IC.canister_settings = 
          {
            freezing_threshold = null;
            controllers = ?[Principal.fromActor(self)];
            memory_allocation = null;
            compute_allocation = null;
          };

          Cycles.add(1_000_000_000_000);
          let result = await ic.create_canister({settings = ?settings});
          let canister_id = result.canister_id;
          ownedCanisters := Array.append(ownedCanisters, [canister_id]);
          canisterPermissions.put(canister_id, true);
          canisterStatus.put(canister_id, #stopped);
          proposal := Types.update_canister_id(proposal, canister_id);
        };
        case (#installCode) {
          let canister_id = Option.unwrap(proposal.canister_id);

          Cycles.add(1_000_000_000_000);
          await ic.install_code({
            arg = [];
            wasm_module = Blob.toArray(Option.unwrap(proposal.wasm_code));
            mode = #install;
            canister_id;
          });
        };
        case (#upgradeCode) {
          let canister_id = Option.unwrap(proposal.canister_id);

          Cycles.add(1_000_000_000_000);
          await ic.install_code({
            arg = [];
            wasm_module = Blob.toArray(Option.unwrap(proposal.wasm_code));
            mode = #upgrade;
            canister_id;
          });
        };
        case (#uninstallCode) {
          let canister_id = Option.unwrap(proposal.canister_id);

          Cycles.add(1_000_000_000_000);
          await ic.uninstall_code({
            canister_id;
          });
        };
        case (#startCanister) {
          let canister_id = Option.unwrap(proposal.canister_id);

          Cycles.add(1_000_000_000_000);
          await ic.start_canister({
            canister_id;
          });
        };
        case (#stopCanister) {
          let canister_id = Option.unwrap(proposal.canister_id);

          Cycles.add(1_000_000_000_000);
          await ic.stop_canister({
            canister_id;
          });
        };
        case (#deleteCanister) {
          let canister_id = Option.unwrap(proposal.canister_id);

          Cycles.add(1_000_000_000_000);
          await ic.delete_canister({
            canister_id;
          });

          canisterStatus.put(canister_id, #deleted);
        };
        case (#addMember) {
          let principal = Option.unwrap(proposal.canister_id);
          ownerList := Array.append(ownerList, [principal]);
          N := ownerList.size();
        };
      };

      proposal := Types.finish_proposer(proposal);
    };

    Debug.print(debug_show(msg.caller, "APPROVED", proposal.ptype, "Proposal ID", proposal.id, "Executed", proposal.finished));
    Debug.print(debug_show());

    proposals.put(id, proposal);
    proposals.get(id)
  };

  system func heartbeat() : async () {
    let ic : IC.Self = actor("aaaaa-aa");
    for( canister_id in canisterStatus.keys()) {
      if (canisterStatus.get(canister_id) != ?#deleted) {
        try {
          let result = await ic.canister_status({canister_id});
          canisterStatus.put(canister_id, result.status);
        } catch e {
          Debug.print(debug_show(Error.message(e)));
        };
      };
    }
  };

  func no_action_check(proposal: Proposal, owner: Owner) : Bool {
    return  Option.isNull(Array.find(proposal.refusers, func(a: Owner) : Bool { a == owner}))
    and     Option.isNull(Array.find(proposal.approvers, func(a: Owner) : Bool { a == owner}));
  };

  func owner_check(owner : Owner) : Bool {
    Option.isSome(Array.find(ownerList, func (a: Owner) : Bool { Principal.equal(a, owner) }))
  };

  func canister_check(canister : Canister) : Bool {
    Option.isSome(Array.find(ownedCanisters, func (a: Canister) : Bool { Principal.equal(a, canister) }))
  };

  public query func get_owner_list() : async [Owner] {
    ownerList
  };

  public query func get_owned_canisters_list() : async [Canister] {
    ownedCanisters
  };

  public query func get_model() : async (Nat, Nat) {
    (M, N)
  };

  public query func get_status(id: Canister) : async ?CanisterStatus {
    canisterStatus.get(id)
  };

  public query func get_permission(id: Canister) : async ?Bool {
    canisterPermissions.get(id)
  };

  public query func get_proposal(id: ID) : async ?Proposal {
    proposals.getOpt(id)
  };

  public query func get_proposals() : async [Proposal] {
    proposals.toArray()
  };
};
