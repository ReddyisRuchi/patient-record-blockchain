// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MedicalRecord {

    struct Record {
        uint256 recordId;
        string recordHash;
        uint256 timestamp;
    }

    struct Event {
        string location;
        string action;
        uint256 timestamp;
    }

    mapping(uint256 => Record) public records;

    mapping(uint256 => Event[]) public history;

    function storeRecord(uint256 _recordId, string memory _recordHash) public {
        records[_recordId] = Record({
            recordId: _recordId,
            recordHash: _recordHash,
            timestamp: block.timestamp
        });
    }

    function getRecord(uint256 _recordId)
        public
        view
        returns (string memory, uint256)
    {
        Record memory record = records[_recordId];
        return (record.recordHash, record.timestamp);
    }

    function addEvent(
        uint256 _recordId,
        string memory _location,
        string memory _action
    ) public {
        history[_recordId].push(Event({
            location: _location,
            action: _action,
            timestamp: block.timestamp
        }));
    }

    function getHistory(uint256 _recordId)
        public
        view
        returns (Event[] memory)
    {
        return history[_recordId];
    }
}