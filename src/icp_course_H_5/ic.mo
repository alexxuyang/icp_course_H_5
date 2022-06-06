// This is a generated Motoko binding.
// Please use `import service "ic:canister_id"` instead to call canisters on the IC if possible.

module {
  public type canister_id = Principal;
  public type canister_settings = {
    freezing_threshold : ?Nat;
    controllers : ?[Principal];
    memory_allocation : ?Nat;
    compute_allocation : ?Nat;
  };
  public type definite_canister_settings = {
    freezing_threshold : Nat;
    controllers : [Principal];
    memory_allocation : Nat;
    compute_allocation : Nat;
  };
  public type ecdsa_curve = { #secp256k1 };
  public type http_header = { value : Text; name : Text };
  public type http_response = {
    status : Nat;
    body : [Nat8];
    headers : [http_header];
  };
  public type user_id = Principal;
  public type wasm_module = [Nat8];
  public type Self = actor {
    canister_status : shared { canister_id : canister_id } -> async {
        status : { #stopped; #stopping; #running };
        freezing_threshold : Nat;
        memory_size : Nat;
        cycles : Nat;
        settings : definite_canister_settings;
        module_hash : ?[Nat8];
        idle_cycles_burned_per_second : Float;
      };
    create_canister : shared { settings : ?canister_settings } -> async {
        canister_id : canister_id;
      };
    delete_canister : shared { canister_id : canister_id } -> async ();
    deposit_cycles : shared { canister_id : canister_id } -> async ();
    ecdsa_public_key : shared {
        key_id : { name : Text; curve : ecdsa_curve };
        canister_id : ?canister_id;
        derivation_path : [[Nat8]];
      } -> async { public_key : [Nat8]; chain_code : [Nat8] };
    http_request : shared {
        url : Text;
        method : { #get };
        body : ?[Nat8];
        transform : ?{
          #function : shared query http_response -> async http_response;
        };
        headers : [http_header];
      } -> async http_response;
    install_code : shared {
        arg : [Nat8];
        wasm_module : wasm_module;
        mode : { #reinstall; #upgrade; #install };
        canister_id : canister_id;
      } -> async ();
    provisional_create_canister_with_cycles : shared {
        settings : ?canister_settings;
        amount : ?Nat;
      } -> async { canister_id : canister_id };
    provisional_top_up_canister : shared {
        canister_id : canister_id;
        amount : Nat;
      } -> async ();
    raw_rand : shared () -> async [Nat8];
    sign_with_ecdsa : shared {
        key_id : { name : Text; curve : ecdsa_curve };
        derivation_path : [[Nat8]];
        message_hash : [Nat8];
      } -> async { signature : [Nat8] };
    start_canister : shared { canister_id : canister_id } -> async ();
    stop_canister : shared { canister_id : canister_id } -> async ();
    uninstall_code : shared { canister_id : canister_id } -> async ();
    update_settings : shared {
        canister_id : Principal;
        settings : canister_settings;
      } -> async ();
  }
}
