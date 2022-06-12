#!/usr/bin/ic-repl

//---------------SETUP---------------//

identity default "./id1.pem";
import DAO = "rrkah-fqaaa-aaaaa-aaaaq-cai";

//---------------Create Canister---------------//

call DAO.propose(variant {createCanister}, null, null);
call DAO.approve(_.id);
