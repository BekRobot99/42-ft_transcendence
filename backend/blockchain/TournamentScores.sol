// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TournamentScores {
    address public owner;

    struct ScoreEntry {
        uint256 matchId;
        address player1;
        address player2;
        uint256 score1;
        uint256 score2;
        address winner;
        uint256 timestamp;
    }

    mapping(uint256 => ScoreEntry[]) public scoresByTournament;

    event ScoreSaved(
        uint256 indexed tournamentId,
        uint256 indexed matchId,
        address indexed player1,
        address player2,
        uint256 score1,
        uint256 score2,
        address winner,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function saveScore(
        uint256 tournamentId,
        uint256 matchId,
        address player1,
        address player2,
        uint256 score1,
        uint256 score2,
        address winner
    ) external onlyOwner {
        require(winner == player1 || winner == player2, "winner must be a player");

        ScoreEntry memory entry = ScoreEntry({
            matchId: matchId,
            player1: player1,
            player2: player2,
            score1: score1,
            score2: score2,
            winner: winner,
            timestamp: block.timestamp
        });

        scoresByTournament[tournamentId].push(entry);

        emit ScoreSaved(
            tournamentId,
            matchId,
            player1,
            player2,
            score1,
            score2,
            winner,
            entry.timestamp
        );
    }
}
