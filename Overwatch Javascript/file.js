//Number of stages currently played
const stages = 2;
//Array to hold all of the matches
var stageMatches = new Array();
//Request to website
var xmlhttp = new XMLHttpRequest();
//Overwatch's API
var url = /*"https://api.overwatchleague.com/schedule";*/ "file:///C:/Users/mcsj1/Documents/schedule.json"


//Arrays for each calculation
var indexObj32;
var indexObjEW;

/*
parses data from url and calls the callback function
*/
xmlhttp.onreadystatechange = function()
{
    if (this.readyState == 4 && (this.status == 200 || this.status ===0)) 
    {
        var myArr = JSON.parse(this.responseText);
        callback(myArr);
    }
};
xmlhttp.open("GET", url, true);
xmlhttp.send();

/*
Callback function for when the data is successfully parsed
*/
function callback(text)
{
	//Get each match from the start to the current stage, depending on the constant stage
	for(var ii = 0; ii < stages; ii++)
	{
		for(var jj = 0; jj < text.data.stages[ii].matches.length; jj++)
		{
			stageMatches.push(text.data.stages[ii].matches[jj]);
		}
	}
	//filter out stage playoffs
	stageMatches = stageMatches.filter(getRegSeason);

	/*
		3-2 section
	*/
	//find 3-2 wins & win percent
	find3_2wins();

	/*
		East West section
	*/
	findEWrecord();	

	/*
		Most resilient team
	*/
	
	//TODO: finish designing this function
	findResiliency();

	/*
		Print Data on page
	*/
	printInfo();
}

/*
void function
calculates 3-2 record for each team
*/
function find3_2wins()
{
	//Add the attribute three two wins & losses to each element in the teamsArray
	teamsArray.forEach(function(value, index, array)
	{ 
		array[index].threetwowins = 0; 
		array[index].threetwolosses = 0; 
		array[index].threetwoties = 0;
	})
	
	//evaluate each match, taking into account 5 map series as ties
	for(var ii = 0; ii < stageMatches.length; ii++)
	{
		var game = getGameObj(stageMatches[ii]);
		var winnerIndex = getTeamIndex(game.winner);
		var loserIndex = getTeamIndex(game.loser);
		//If it was a 5 game series, count the game as a tie
		if(stageMatches[ii].games.length == 5)
		{
			teamsArray[winnerIndex].threetwoties++;
			teamsArray[loserIndex].threetwoties++;
		}
		else
		{
			teamsArray[winnerIndex].threetwowins++;
			teamsArray[loserIndex].threetwolosses++;
		}
	}

	calc32winPercent();
	scriptSort32();
}

/*
Parameter: matches object
return: game object
*/
function getGameObj(game)
{
	var winner = game.winner.abbreviatedName;
	var loser;
	if(game.competitors[0].abbreviatedName === winner)
	{
		loser = game.competitors[1].abbreviatedName;
	}
	else
	{
		loser = game.competitors[0].abbreviatedName;
	}
	return setGame(winner, loser, game.wins[0], game.wins[1]);
}

/*
Input: string representing name of team
Gets the index of a team in teamsArray
*/
function getTeamIndex(name)
{
	for(var ii = 0; ii < teamsArray.length; ii++)
	{
		if(teamsArray[ii].name == name)
		{
			return ii;
		}
	}
}

/*
void function
calculates teams win percent with new 3-2 rules
*/
function calc32winPercent()
{
	var teamsArray32 = teamsArray.slice();
	for(var ii = 0; ii < teamsArray32.length; ii++)
	{
		let gamesPlayed = 	teamsArray32[ii].threetwolosses + 
							teamsArray32[ii].threetwoties + 
							teamsArray32[ii].threetwowins;
		let tiePercentAdded = 0.5 * teamsArray32[ii].threetwoties;
		let winPercentAdded = teamsArray32[ii].threetwowins;
		teamsArray32[ii].winPercent32 = (tiePercentAdded + winPercentAdded)/gamesPlayed;
	}
}

/*
Uses indexObj32 to create new Array containing just what we need
and sorts the data
*/
function scriptSort32()
{
	indexObj32 = new Array();
	for(var ii = 0; ii < teamsArray.length;ii++)
	{
		var obj = 
		{
			name: teamsArray[ii].name,
			percent: teamsArray[ii].winPercent32,
			threetwowins: teamsArray[ii].threetwowins,
			threetwoties: teamsArray[ii].threetwoties,
			threetwolosses: teamsArray[ii].threetwolosses
		};
		indexObj32.push(obj); 
	}

	indexObj32.sort(function(a, b)
	{
		return b.percent - a.percent;
	})
}

/*
Uses indexObjEW to create new Array containing just what we need
and sorts the data
*/
function scriptSortEW()
{
	indexObjEW = new Array();
	for(var ii = 0; ii < teamsArray.length;ii++)
	{
		var obj = 
		{
			name: teamsArray[ii].name,
			percent: teamsArray[ii].winPercentEW,
			eastWins: teamsArray[ii].eastWins,
			eastLosses: teamsArray[ii].eastLosses,
			westWins: teamsArray[ii].westWins,
			westLosses: teamsArray[ii].westLosses,
		};
		indexObjEW.push(obj); 
	}

	indexObjEW.sort(function(a, b)
	{
		return b.percent - a.percent;
	})
}

/*
Calculates the global east-west win records and adds
individual east-west wins and losses to each team
*/
function findEWrecord()
{
	//Add the attribute east west wins & losses to each element in the teamsArray
	teamsArray.forEach(function(value, index, array)
	{ 
		array[index].eastWins = 0; 
		array[index].eastLosses = 0;
		array[index].westWins = 0;
		array[index].westLosses = 0;
		array[index].winPercentEW = 0;
	})

	//evaluate each match, determining if it 
	for(var ii = 0; ii < stageMatches.length; ii++)
	{
		var game = getGameObj(stageMatches[ii]);
		var winnerIndex = getTeamIndex(game.winner);
		var loserIndex = getTeamIndex(game.loser);
		
		//Add to global east west record
		//Additionally, add to indiviual team record
		if(teamsArray[winnerIndex].west == true)
		{
			westWins++;
			teamsArray[loserIndex].westLosses++;
		}
		else
		{
			eastWins++;
			teamsArray[loserIndex].eastLosses++;
		}
		if(teamsArray[loserIndex].west == true)
		{
			westLosses++;
			teamsArray[winnerIndex].westWins++;
		}
		else
		{
			eastLosses++;
			teamsArray[winnerIndex].eastWins++;
		}
		if(teamsArray[winnerIndex].west == true && teamsArray[loserIndex].west == false)
		{
			westWinsOverEast++;
		}
		else if(teamsArray[winnerIndex].west == false && teamsArray[loserIndex].west == true)
		{
			eastWinsOverWest++;
		}
	}

	calcEWwinPercent();
	scriptSortEW();
}

/*
void function
calculates teams win percent with new EW rules
*/
function calcEWwinPercent()
{
	var teamsArrayEW = teamsArray.slice();
	for(var ii = 0; ii < teamsArrayEW.length; ii++)
	{
		let gamesPlayed = 	teamsArrayEW[ii].eastWins +
							teamsArrayEW[ii].eastLosses +
							teamsArrayEW[ii].westWins+
							teamsArrayEW[ii].westLosses;
		let eastWinPercent = (teamsArrayEW[ii].eastWins)/(teamsArrayEW[ii].eastWins + teamsArrayEW[ii].eastLosses);
		let westWinPercent = (teamsArrayEW[ii].westWins)/(teamsArrayEW[ii].westWins + teamsArrayEW[ii].westLosses);
		teamsArrayEW[ii].winPercentEW = (eastWinPercent + westWinPercent) / 2;
	}
}

/*
void function
calculates teams resiliency under the following rules
*/
function findResiliency()
{
		//Add the attribute east west wins & losses to each element in the teamsArray
	teamsArray.forEach(function(value, ii, array)
	{ 
		array[ii].resiliencyMatches = 0;
		array[ii].resiliencyGameWins = 0;
		array[ii].resiliencyGameTies = 0;		
		array[ii].resiliencyGameLosses = 0;
		array[ii].resiliencyReverses = 0;
		array[ii].resiliencyAverage = 0;
		array[ii].resiliencyPoints = 0;
	})

	for(var ii = 0; ii < stageMatches.length; ii++)
	{
		var team0 = getTeamIndex(stageMatches[ii].competitors[0]);
		var team1 = getTeamIndex(stageMatches[ii].competitors[1]);
		var games = stageMatches[ii].games;
		var resilientNum;
		//Test if it is a resilient game & calls helper function.
		if(games[0].points[0] > games[0].points[1] && games[1].points[0] > games[1].points[1])
		{
			resilientWorker([team0, team1], 1, games);
		}
		else if (games[0].points[1] > games[0].points[0] && games[1].points[1] > games[1].points[0])
		{
			resilientWorker([team0, team1], 0, games);
		}

	}
}

function resilientWorker(teams, resilientId, games)
{
	for(var ii = 2; ii < games.length; ii++)
	{
		if(games[ii].points[0] == games[ii].points[1])
		{
			teams[resilientId].resiliencyGameTies;
		}
	}
}

function printInfo()
{
	//Creates a div to add to the body
	var div = document.createElement("div");
	//Appends data to created div
	var eWdiv = printEW();
	div.appendChild(eWdiv);
	//Can add more divs later

	var body = document.querySelector("body");
	body.appendChild(div);
}

function printEW()
{
	var div = document.createElement("div");
	var tbl = document.createElement("table");
	tbl.setAttribute("border", "1");

	var thd = document.createElement('thead');
	var tbdy = document.createElement('tbody');
	//Add header to the table
	var topRow = document.createElement('tr');
	//I use -1 here because I wanted to add numbers to make the table easier to read,
	//but this was after I made the table
	for(var ii = -1; ii < Object.keys(indexObjEW[0]).length; ii++)
	{
    	var th = document.createElement('th');
    	if(ii == -1)
    	{
    		th.appendChild(document.createTextNode("Ranking"));
    	}
    	if(ii == 0)
    	{
    		th.appendChild(document.createTextNode("Team Name"));
    	}
    	else if(ii == 1)
    	{
    		th.appendChild(document.createTextNode("East Wins"));
    	}
    	else if(ii == 2)
    	{
    		th.appendChild(document.createTextNode("East Losses"));
    	}
    	else if(ii == 3)
    	{
    		th.appendChild(document.createTextNode("West Wins"));
    	}
    	else if(ii == 4)
    	{
    		th.appendChild(document.createTextNode("West Losses"));
    	}
    	else if(ii == 5)
    	{
    		th.appendChild(document.createTextNode("East/West Win Percent"));
    	}
        topRow.appendChild(th)
	}
	thd.appendChild(topRow);
	tbl.appendChild(thd);

	//Add each team to the table
	for (var ii = 0; ii < indexObjEW.length; ii++) {
		var tr = document.createElement('tr');
		//Explanation for -1 above
	    for (var jj = -1; jj < Object.keys(indexObjEW[ii]).length; jj++) 
	    {
	    	var td = document.createElement('td');
	    	if(jj == -1)
	    	{
	    		td.appendChild(document.createTextNode((ii+1).toString()));
	    	}
	    	if(jj == 0)
	    	{
	    		td.appendChild(document.createTextNode(indexObjEW[ii].name));
	    	}
	    	else if(jj == 1)
	    	{
	    		td.appendChild(document.createTextNode(indexObjEW[ii].eastWins.toString()));
	    	}
	    	else if(jj == 2)
	    	{
	    		td.appendChild(document.createTextNode(indexObjEW[ii].eastLosses.toString()));
	    	}
	    	else if(jj == 3)
	    	{
	    		td.appendChild(document.createTextNode(indexObjEW[ii].westWins.toString()));
	    	}
	    	else if(jj == 4)
	    	{
	    		td.appendChild(document.createTextNode(indexObjEW[ii].westLosses.toString()));
	    	}
	    	else if(jj == 5)
	    	{
	    		td.appendChild(document.createTextNode(indexObjEW[ii].percent.toString()));
	    	}
	        tr.appendChild(td)
	    }
		tbdy.appendChild(tr);
	}
	tbl.appendChild(tbdy);
	div.appendChild(tbl);
	return div;
}