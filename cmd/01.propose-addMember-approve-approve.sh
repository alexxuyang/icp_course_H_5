#!/usr/bin/ic-repl

identity default "./id1.pem";
import canister = "rrkah-fqaaa-aaaaa-aaaaq-cai";
call canister.propose(variant {addMember}, opt principal "qi6vk-xtur4-bhk2p-a6xbl-24e5g-fowwf-lq35j-gbfep-oh4ci-jztmj-zae", null);
let proposal_id1 = _.id;
call canister.approve(proposal_id1);

identity default "./id2.pem";
call canister.approve(proposal_id1);
