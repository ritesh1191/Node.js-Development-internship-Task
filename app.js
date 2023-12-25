// app.js

const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  try {
    const username = req.query.username;
    let error = null; // Initialize error variable

    if (!username) {
      error = "Please provide a GitHub username.";
      return res.render("index", { error });
    }

    const githubData = await fetchGitHubData(username);

    if (!githubData) {
      error = "User not found or unable to fetch data.";
      return res.render("index", { error });
    }

    const contributionGraph =
      githubData.user.contributionsCollection.contributionCalendar;

    res.render("index", { username, contributionGraph, error });
  } catch (error) {
    console.error("Error:", error.message);
    res.render("index", {
      error: "An error occurred while processing your request.",
    });
  }
});

async function fetchGitHubData(username) {
  const query = `
    query {
      user(login: "${username}") {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://api.github.com/graphql",
      { query },
      {
        headers: {
          Authorization: `Bearer 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`,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error("GitHub API Error:", error.message);
    return null;
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
