#!/usr/bin/ic-repl

//---------------SETUP---------------//

identity default "./id1.pem";
import canister = "rrkah-fqaaa-aaaaa-aaaaq-cai";

//---------------Create Canister---------------//

call canister.propose(variant {createCanister}, null, null);
call canister.approve(_.id);
