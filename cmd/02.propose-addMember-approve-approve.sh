#!/usr/bin/ic-repl

//---------------SETUP---------------//

identity default "./id1.pem";
import DAO = "rrkah-fqaaa-aaaaa-aaaaq-cai";
let member = opt principal "sngub-d3idv-rdr26-clrtg-3uubc-xk2xi-sgcmg-zsy65-hmi5n-t4rbw-6ae";

//---------------ADD MEMBER---------------//

call DAO.propose(variant {addMember}, member, null);
let proposal_id = _.id;
call DAO.approve(proposal_id);

identity default "./id2.pem";
call DAO.approve(proposal_id);
