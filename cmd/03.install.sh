#!/usr/bin/ic-repl
// assume we already installed the greet canister

// change to id1
identity default "./id1.pem";

// import the default canister, need: dfx start --clean
import canister = "rrkah-fqaaa-aaaaa-aaaaq-cai";

let canister_id = principal "qjdve-lqaaa-aaaaa-aaaeq-cai";

//---------------INSTALL CODE---------------//

identity default "./id3.pem";

call canister.propose(variant {installCode}, opt canister_id, opt file "hello.wasm");
let proposal_id = _.id;

call canister.approve(proposal_id);
