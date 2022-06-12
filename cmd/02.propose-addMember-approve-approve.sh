#!/usr/bin/ic-repl

//---------------SETUP---------------//

identity default "./id1.pem";
import DAO = "rrkah-fqaaa-aaaaa-aaaaq-cai";
let member = opt principal "2wh6w-yfhox-qidxz-5zxer-hool6-tgyda-4xwtn-3b3ev-h2xss-wyvjx-3qe";

//---------------ADD MEMBER---------------//

call DAO.propose(variant {addMember}, member, null);
let proposal_id = _.id;
call DAO.approve(proposal_id);

identity default "./id2.pem";
call DAO.approve(proposal_id);
