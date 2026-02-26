// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MedicalRecord {

    struct Record {
        uint256 recordId;
        string recordHash;
        uint256 timestamp;
    }

    mapping(uint256 => Record) public records;

    function storeRecord(uint256 _recordId, string memory _recordHash) public {
        records[_recordId] = Record({
            recordId: _recordId,
            recordHash: _recordHash,
            timestamp: block.timestamp
        });
    }

    function getRecord(uint256 _recordId) public view returns (string memory, uint256) {
        Record memory record = records[_recordId];
        return (record.recordHash, record.timestamp);
    }
}