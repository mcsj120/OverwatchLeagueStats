/*
name = string
west = boolean
*/
function setTeam(name, west)
{
	if(typeof name === "string" && typeof west === "boolean")
	{
		var obj = 
		{
			name: name,
			west: west,
			wins: 0,
			losses: 0
		};
		return obj;
	}
	else
	{
		return null;
	}
}
/*
Takes a teamsArray object. Adds resiliency stats to each team
*/
function addTeamResiliencyStats(teamsArray)
{
	for(var ii = 0; ii < teamsArray.length; ii++)
	{
		teamsArray[ii].resiliencyMatches = 0;
		teamsArray[ii].resiliencyGameWins = 0;
		teamsArray[ii].resiliencyGameLosses = 0;
		teamsArray[ii].resiliencyReverses = 0;
		teamsArray[ii].resiliencyAverage = 0;
	}
}

/*
winner = string
loser = string
wscore = number
lscore = number
*/
function setGame(winner, loser, wscore, lscore)
{
	if(typeof winner === "string" && typeof loser === "string")
	{
		var obj = 
		{
			winner: winner,
			loser: loser,
			wscore: wscore, 
			lscore: lscore
		};
		return obj;
	}
	else
	{
		return null;
	}
}

function setPlayer(name, final, death, time)
{
	var obj = 
	{
		name: name,
		final: final,
		death: death, 
		time: time
	};
	return obj;
}

/*
takes a match from overwatch league
returns if a regular season game
*/
function getRegSeason(obj)
{
	return obj.tournament.type === "OPEN_MATCHES";
}

/*
teamsArray is used to store team objects
*/
var teamsArray = new Array();
abbrNameWest = ["SEO", "GLA", "SHD", "HZS", "DAL", "SFS", "CDH", "GZC", "VAL", "VAN"];
abbrNameEast = ["PHI", "LDN", "NYE", "BOS", "TOR", "HOU", "ATL", "FLA", "PAR", "WAS"];
for(var ii = 0; ii < abbrNameWest.length; ii++)
{
	teamsArray.push(setTeam(abbrNameWest[ii], true));
}
for(var ii = 0; ii < abbrNameEast.length; ii++)
{
	teamsArray.push(setTeam(abbrNameEast[ii], false));
}


/*
Used for keeping track of east and west wins
*/
var eastWins = 0;
var eastLosses = 0;
var westWins = 0;
var westLosses = 0;

var eastWinsOverWest = 0;
var westWinsOverEast = 0;