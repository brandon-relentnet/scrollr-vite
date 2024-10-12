// src/utils/useFetchGames.js
import { useEffect, useState } from "react";

// Helper function to calculate date ranges
const calculateDateRange = (today, daysOffset) => {
  const newDate = new Date(today);
  newDate.setDate(today.getDate() + daysOffset);
  return newDate;
};

export const useFetchGames = (settings) => {
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const dayOfWeek = today.getDay();
        let startDate, endDate, leagueType;

        // Date logic based on weekRange and selectedSport
        if (settings.selectedSport === "football") {
          const lastThursday = new Date(today);
          lastThursday.setDate(today.getDate() - ((dayOfWeek + 3) % 7));
          const nextMonday = new Date(lastThursday);
          nextMonday.setDate(lastThursday.getDate() + 4);

          if (settings.weekRange === "previous" || dayOfWeek === 2) {
            const previousThursday = new Date(lastThursday);
            previousThursday.setDate(lastThursday.getDate() - 7);
            const previousMonday = new Date(previousThursday);
            previousMonday.setDate(previousThursday.getDate() + 4);

            startDate = previousThursday;
            endDate = previousMonday;
          } else if (settings.weekRange === "next") {
            const upcomingThursday = new Date(lastThursday);
            upcomingThursday.setDate(lastThursday.getDate() + 7);
            const upcomingMonday = new Date(upcomingThursday);
            upcomingMonday.setDate(upcomingThursday.getDate() + 4);

            startDate = upcomingThursday;
            endDate = upcomingMonday;
          } else {
            startDate = lastThursday;
            endDate = nextMonday;
          }

          leagueType = "nfl";
        } else {
          // Handle non-football sports date ranges
          if (settings.weekRange === "previous") {
            startDate = calculateDateRange(today, -8);
            endDate = calculateDateRange(today, -4);
          } else if (settings.weekRange === "next") {
            startDate = calculateDateRange(today, 4);
            endDate = calculateDateRange(today, 8);
          } else {
            startDate = calculateDateRange(today, -4);
            endDate = calculateDateRange(today, 4);
          }

          switch (settings.selectedSport) {
            case "hockey":
              leagueType = "nhl";
              break;
            case "baseball":
              leagueType = "mlb";
              break;
            case "basketball":
              leagueType = "nba";
              break;
            default:
              leagueType = "nfl"; // Default to NFL
          }
        }

        // Format date for the API
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}${month}${day}`;
        };

        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);

        // Fetch data from ESPN API
        const response = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/${settings.selectedSport}/${leagueType}/scoreboard?dates=${formattedStartDate}-${formattedEndDate}`
        );
        const data = await response.json();

        // Process events data
        if (data.events && data.events.length > 0) {
          const fetchedBlocks = data.events.map((event) => {
            const competition = event.competitions[0];
            const competitors = competition.competitors;
            const homeTeam = competitors.find(
              (team) => team.homeAway === "home"
            );
            const awayTeam = competitors.find(
              (team) => team.homeAway === "away"
            );

            const homeTeamName = homeTeam.team.shortDisplayName || "Home";
            const awayTeamName = awayTeam.team.shortDisplayName || "Away";
            const homeTeamScore = homeTeam.score || "0";
            const awayTeamScore = awayTeam.score || "0";

            const homeTeamLogo = homeTeam.team.logo;
            const awayTeamLogo = awayTeam.team.logo;

            const statusType = event.status.type.name;
            let status;
            let isLive = false;

            if (statusType === "STATUS_FINAL") {
              status = "Final";
            } else if (statusType === "STATUS_SCHEDULED") {
              status = "Scheduled";
            } else if (statusType === "STATUS_IN_PROGRESS") {
              status = "In Progress";
              isLive = true;
            } else {
              status = "In Progress";
            }

            const eventDate = new Date(event.date);
            const formattedEventDate = eventDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            const homeTeamWon = homeTeam.winner || false;
            const awayTeamWon = awayTeam.winner || false;

            const gameLink =
              event.links && event.links[0] ? event.links[0].href : null;

            return {
              title: `${awayTeamName} @ ${homeTeamName}`,
              points: `${awayTeamScore} - ${homeTeamScore}`,
              status: status,
              date: formattedEventDate,
              isLive: isLive,
              id: event.id,
              homeTeamLogo,
              awayTeamLogo,
              href: gameLink,
              homeTeamWon,
              awayTeamWon,
            };
          });

          setBlocks(fetchedBlocks);
        } else {
          console.warn("No games available for the selected date range.");
          setBlocks([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (settings.selectedSport && settings.weekRange) {
      fetchData();
    }
  }, [settings.selectedSport, settings.weekRange]);

  return blocks;
};
