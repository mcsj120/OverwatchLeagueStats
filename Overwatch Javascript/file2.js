var playerArray = new Array();

var url = "https://api.overwatchleague.com/stats/players";
/*
parses data from url and calls the callback function
*/
xmlhttp.onreadystatechange = function()
{
    if (this.readyState == 4 && this.status == 200) 
    {
        var myArr = JSON.parse(this.responseText);
        callback2(myArr);
    }
};
xmlhttp.open("GET", url, true);
xmlhttp.send();

function callback2(text)
{
	for(var ii = 0; ii < text.data.length; ii++)
	{
		playerArray.push(setPlayer(text.data[ii].name, text.data[ii].final_blows_avg_per_10m, text.data[ii].deaths_avg_per_10m, text.data[ii].time_played_total))
		playerArray[ii].kd = playerArray[ii].final/playerArray[ii].death
	}
	playerArray.sort(function(a, b)
	{
		return b.final/b.death - a.final/a.death;
	})
	playerArray = playerArray.filter(function(a)
	{
		return a.time > 7200;
	})
}