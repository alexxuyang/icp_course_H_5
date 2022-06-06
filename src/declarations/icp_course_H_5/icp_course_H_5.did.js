export const idlFactory = ({ IDL }) => {
  const Owner = IDL.Principal;
  const ID = IDL.Nat;
  const ID__1 = IDL.Nat;
  const Canister = IDL.Principal;
  const ProposalType = IDL.Variant({
    'stopCanister' : IDL.Null,
    'upgradeCode' : IDL.Null,
    'addPermission' : IDL.Null,
    'installCode' : IDL.Null,
    'uninstallCode' : IDL.Null,
    'startCanister' : IDL.Null,
    'removePermission' : IDL.Null,
    'createCanister' : IDL.Null,
    'deleteCanister' : IDL.Null,
  });
  const Proposal = IDL.Record({
    'id' : ID__1,
    'canister_id' : IDL.Opt(Canister),
    'refusers' : IDL.Vec(Owner),
    'finished' : IDL.Bool,
    'wasm_code_hash' : IDL.Vec(IDL.Nat8),
    'proposer' : Owner,
    'ptype' : ProposalType,
    'approvers' : IDL.Vec(Owner),
    'wasm_code' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const Canister__1 = IDL.Principal;
  const Owner__1 = IDL.Principal;
  const ProposalType__1 = IDL.Variant({
    'stopCanister' : IDL.Null,
    'upgradeCode' : IDL.Null,
    'addPermission' : IDL.Null,
    'installCode' : IDL.Null,
    'uninstallCode' : IDL.Null,
    'startCanister' : IDL.Null,
    'removePermission' : IDL.Null,
    'createCanister' : IDL.Null,
    'deleteCanister' : IDL.Null,
  });
  const cycle_manager = IDL.Service({
    'approve' : IDL.Func([ID], [Proposal], []),
    'get_model' : IDL.Func([], [IDL.Nat, IDL.Nat], ['query']),
    'get_owned_canisters_list' : IDL.Func(
        [],
        [IDL.Vec(Canister__1)],
        ['query'],
      ),
    'get_owner_list' : IDL.Func([], [IDL.Vec(Owner__1)], ['query']),
    'get_permission' : IDL.Func([Canister__1], [IDL.Opt(IDL.Bool)], ['query']),
    'get_proposal' : IDL.Func([ID], [IDL.Opt(Proposal)], ['query']),
    'get_proposals' : IDL.Func([], [IDL.Vec(Proposal)], ['query']),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], []),
    'propose' : IDL.Func(
        [ProposalType__1, IDL.Opt(Canister__1), IDL.Opt(IDL.Vec(IDL.Nat8))],
        [Proposal],
        [],
      ),
    'refuse' : IDL.Func([ID], [Proposal], []),
  });
  return cycle_manager;
};
export const init = ({ IDL }) => {
  const Owner = IDL.Principal;
  return [IDL.Nat, IDL.Vec(Owner)];
};
