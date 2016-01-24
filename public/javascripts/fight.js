if (window.console) {
    console.log("Welcome to your Play application's JavaScript!");
}

/****************************************************
    Functions to support drag and drop functionality
*****************************************************/
$(function() {
    $("#selected_fight").draggable({
      opacity: 1.0,
      revert: true,
      revertDuration: 100,
      zIndex: 100
    });
    $("#add_fight_button").droppable({
      drop: function(event, ui) {
        var athlete1 = ui.draggable.find("#athlete1_stats");
        var athlete2 = ui.draggable.find("#athlete2_stats");
        var athleteName1 = athlete1.find(".fullname")[0].innerText;
        var athleteName2 = athlete2.find(".fullname")[0].innerText;
        addRowToPortfolio(athleteName1);
        addRowToPortfolio(athleteName2);
      }
    });
});

function addRowToPortfolio(athleteName) {
    var $row = $(".athlete_fight_row").first().clone();
    $row.find("td").empty();
    $row.find(".athlete_name").html(athleteName);
    $row.appendTo("#portfolio_table");
}

// Add empty fight to the portfolio
function addFightToPortfolio() {
    // Add row for each athlete
    addRowToPortfolio("");
    addRowToPortfolio("");
}

/********************************************
    Objects for tracking and re-using data 
*********************************************/
// object to map event_name => event_id
var eventNameIdMap = {};
// object for mapping fight_name => athletes data
var fightToAthleteData = {};


/************************************************
    On page-load => populate events drop down
*************************************************/
$(document).ready(function() {
    var getEventsCall = jsRoutes.controllers.StatsDatabase.getEvents(1);
    $.getJSON(
        getEventsCall.url,
        function(data, textStatus, xhr) {
            if(textStatus == "success") {
                $.each(data, function(index, value) {
                    // Create datalist option
                    $("#events").append("<option value='" + value["name"] + "'></option>");
                    // Add item to event name to ID map
                    eventNameIdMap[value["name"]] = value["id"];
                });
            }
            if(textStatus == "error") {
                alert("Error for getEvents: " + xhr.status + ": " + xhr.statusText);
            }
        }
    );
});


/***************************************************
    On event-selection => populate fights drop down
****************************************************/
function populateFights(eventName) {
    var eventId = eventNameIdMap[eventName];
    var getFightsCall = jsRoutes.controllers.StatsDatabase.getFights(eventId);
    $.getJSON(
        getFightsCall.url,
        function(data, textStatus, xhr) {
            if(textStatus == "success") {
                // Clear original list
                $("#fights").empty();
                $.each(data, function(index, value) {
                     createFightOption(value["id"], value["athlete1_id"], value["athlete2_id"]);
                });
            }
            if(textStatus == "error") {
                alert("Error for getFights: " + xhr.status + ": " + xhr.statusText);
            }
        }
    );
}

function createFightOption(fightId, athlete1Id, athlete2Id) {
    var getAthleteNamesCall = jsRoutes.controllers.StatsDatabase.getAthleteNames(fightId);
    $.getJSON(
        getAthleteNamesCall.url,
        function(data, textStatus, xhr) {
            if(textStatus == "success") {
                var fightName = data["athlete1"]+ " vs. " + data["athlete2"];
                fightToAthleteData[fightName] = {"athlete1_id": athlete1Id, "athlete2_id": athlete2Id};

                // Create datalist option
                $("#fights").append(
                    "<option value='" + fightName + "'></option>"
                );
            }
            if(textStatus == "error") {
                alert("Error for getAthleteNames: " + xhr.status + ": " + xhr.statusText);
            }
        }
    );
}


/***************************************************
    Set fighter stats upon fight selection
****************************************************/
function populateAthleteStats(fightName) {

    // Get athlete 1 data
    var athlete1Id = fightToAthleteData[fightName]["athlete1_id"];
    var getAthleteCall1 = jsRoutes.controllers.StatsDatabase.getAthlete(athlete1Id);
    $.getJSON(
        getAthleteCall1.url,
        function(data, textStatus, xhr) {
            if(textStatus == "success") {
                // Set spans in athlete1_stats div
                $("#athlete1_stats span.fullname").text(data['fullname']);
                var record = data['wins'] + "-" + data['losses'];
                $("#athlete1_stats span.record").text(record);
                $("#athlete1_stats span.weight").text(data['weight_kg'] + "kg");
                $("#athlete1_stats span.height").text(data['height_cm'] + "cm");
            }
            if(textStatus == "error") {
                alert("Error for getFights: " + xhr.status + ": " + xhr.statusText);
            }
        }
    );

    // Get athlete 2 data
    var athlete2Id = fightToAthleteData[fightName]["athlete2_id"];
    var getAthleteCall2 = jsRoutes.controllers.StatsDatabase.getAthlete(athlete2Id);
    $.getJSON(
        getAthleteCall2.url,
        function(data, textStatus, xhr) {
            if(textStatus == "success") {
                // Set spans in athlete2_stats div
                $("#athlete2_stats span.fullname").text(data['fullname']);
                var record = data['wins'] + "-" + data['losses'];
                $("#athlete2_stats span.record").text(record);
                $("#athlete2_stats span.weight").text(data['weight_kg'] + "kg");
                $("#athlete2_stats span.height").text(data['height_cm'] + "cm");
            }
            if(textStatus == "error") {
                alert("Error for getFights: " + xhr.status + ": " + xhr.statusText);
            }
        }
    );
}
