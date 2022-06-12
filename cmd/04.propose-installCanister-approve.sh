#!/usr/bin/ic-repl

//---------------SETUP---------------//

identity default "./id3.pem";
import DAO = "rrkah-fqaaa-aaaaa-aaaaq-cai";
let canister_id = principal "qjdve-lqaaa-aaaaa-aaaeq-cai";
let wasm_code = opt file "hello.wasm";

//---------------INSTALL CODE---------------//

call DAO.propose(variant {installCode}, opt canister_id, wasm_code);
call DAO.approve(_.id);
