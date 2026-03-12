import { useState, useEffect } from "react";
import "./App.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

import {
  FaSearch,
  FaBell,
  FaUser,
  FaMoon,
  FaSun,
  FaHome,
  FaBookmark,
  FaBriefcase,
  FaChartBar,
  FaCog,
} from "react-icons/fa";

function App() {
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [page, setPage] = useState("dashboard");

  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState("none");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("savedJobs")) || [];
    setSavedJobs(stored);

    const defaultSearch = localStorage.getItem("defaultSearch");
    if (defaultSearch) setQuery(defaultSearch);
  }, []);

  const saveJob = (job) => {
    const updated = [...savedJobs, job];
    setSavedJobs(updated);
    localStorage.setItem("savedJobs", JSON.stringify(updated));
  };

  const clearSavedJobs = () => {
    localStorage.removeItem("savedJobs");
    setSavedJobs([]);
  };

  const searchJobs = async () => {
    setLoading(true);

    const url = `https://jsearch.p.rapidapi.com/search?query=${query}&num_pages=1`;

    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY",
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    };

    const res = await fetch(url, options);
    const data = await res.json();

    setJobs(data.data || []);
    setLoading(false);
  };

  let filteredJobs = [...jobs];

  if (remoteOnly) {
    filteredJobs = filteredJobs.filter((j) => j.job_is_remote);
  }

  if (sortBy === "company") {
    filteredJobs.sort((a, b) => a.employer_name.localeCompare(b.employer_name));
  }

  if (sortBy === "title") {
    filteredJobs.sort((a, b) => a.job_title.localeCompare(b.job_title));
  }

  const chartData = [
    { day: "Mon", jobs: 3 },
    { day: "Tue", jobs: 7 },
    { day: "Wed", jobs: 4 },
    { day: "Thu", jobs: 9 },
    { day: "Fri", jobs: 6 },
  ];

  /* ANALYTICS DATA */

  const remoteCount = jobs.filter((j) => j.job_is_remote).length;

  const companyCounts = {};

  jobs.forEach((job) => {
    companyCounts[job.employer_name] =
      (companyCounts[job.employer_name] || 0) + 1;
  });

  const topCompanies = Object.entries(companyCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const countryCounts = {};

  jobs.forEach((job) => {
    countryCounts[job.job_country] = (countryCounts[job.job_country] || 0) + 1;
  });

  const countryData = Object.entries(countryCounts).map(([country, count]) => ({
    country,
    count,
  }));

  return (
    <div className={dark ? "app dark" : "app"}>
      {/* SIDEBAR */}

      <div className="sidebar">
        <h2>HireFlow</h2>

        <ul className="menu">
          <li onClick={() => setPage("dashboard")}>
            <FaHome className="menuIcon" />
            Dashboard
          </li>

          <li onClick={() => setPage("dashboard")}>
            <FaSearch className="menuIcon" />
            Job Search
          </li>

          <li onClick={() => setPage("saved")}>
            <FaBookmark className="menuIcon" />
            Saved Jobs
          </li>

          <li>
            <FaBriefcase className="menuIcon" />
            Applications
          </li>

          <li onClick={() => setPage("analytics")}>
            <FaChartBar className="menuIcon" />
            Analytics
          </li>

          <li onClick={() => setPage("settings")}>
            <FaCog className="menuIcon" />
            Settings
          </li>
        </ul>
      </div>

      {/* MAIN */}

      <div className="main">
        {/* NAVBAR */}

        <div className="navbar">
          <div className="searchNav">
            <FaSearch />
            <input placeholder="Search anything" />
          </div>

          <div className="navRight">
            <button className="toggle" onClick={() => setDark(!dark)}>
              {dark ? <FaSun /> : <FaMoon />}
            </button>

            <FaBell />
            <FaUser />
          </div>
        </div>

        {/* DASHBOARD */}

        {page === "dashboard" && (
          <>
            <h1>Job Dashboard</h1>

            <div className="searchBox">
              <input
                placeholder="Search developer jobs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <button onClick={searchJobs}>Search</button>
            </div>

            {/* FILTERS */}

            <div className="filters">
              <label>
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={() => setRemoteOnly(!remoteOnly)}
                />
                Remote Only
              </label>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="none">Sort By</option>
                <option value="company">Company</option>
                <option value="title">Job Title</option>
              </select>
            </div>

            {/* STATS */}

            <div className="stats">
              <div className="statCard gradient1">
                <h4>Jobs Found</h4>
                <p>{jobs.length}</p>
              </div>

              <div className="statCard gradient2">
                <h4>Companies</h4>
                <p>{new Set(jobs.map((j) => j.employer_name)).size}</p>
              </div>

              <div className="statCard gradient3">
                <h4>Remote Jobs</h4>
                <p>{remoteCount}</p>
              </div>

              <div className="statCard gradient4">
                <h4>Saved Jobs</h4>
                <p>{savedJobs.length}</p>
              </div>
            </div>

            {/* CHART */}

            <div className="chartCard">
              <h3>Job Activity</h3>

              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="jobs"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* JOB GRID */}

            <div className="jobGrid">
              {loading
                ? Array(6)
                    .fill()
                    .map((_, i) => <div key={i} className="skeletonCard" />)
                : filteredJobs.map((job) => (
                    <div key={job.job_id} className="card">
                      {job.employer_logo && (
                        <img src={job.employer_logo} className="logo" />
                      )}

                      <h3>{job.job_title}</h3>

                      <p>{job.employer_name}</p>

                      <p className="location">
                        {job.job_city} {job.job_country}
                      </p>

                      <div className="cardActions">
                        <a href={job.job_apply_link} target="_blank">
                          Apply
                        </a>

                        <button onClick={() => saveJob(job)}>Save Job</button>
                      </div>
                    </div>
                  ))}
            </div>
          </>
        )}

        {/* SAVED JOBS */}

        {page === "saved" && (
          <>
            <h1>Saved Jobs</h1>

            <div className="jobGrid">
              {savedJobs.map((job) => (
                <div key={job.job_id} className="card">
                  {job.employer_logo && (
                    <img src={job.employer_logo} className="logo" />
                  )}

                  <h3>{job.job_title}</h3>

                  <p>{job.employer_name}</p>

                  <p className="location">
                    {job.job_city} {job.job_country}
                  </p>

                  <a href={job.job_apply_link} target="_blank">
                    Apply
                  </a>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ANALYTICS */}

        {page === "analytics" && (
          <>
            <h1>Job Market Analytics</h1>

            <div className="analyticsGrid">
              <div className="chartCard">
                <h3>Top Hiring Companies</h3>

                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topCompanies}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />

                    <Bar dataKey="count" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chartCard">
                <h3>Jobs by Country</h3>

                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={countryData}>
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />

                    <Bar dataKey="count" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* SETTINGS */}

        {page === "settings" && (
          <>
            <h1>Settings</h1>

            <div className="settingsPanel">
              <div className="settingItem">
                <h3>Dark Mode</h3>

                <button onClick={() => setDark(!dark)}>Toggle Dark Mode</button>
              </div>

              <div className="settingItem">
                <h3>Clear Saved Jobs</h3>

                <button onClick={clearSavedJobs}>Clear Jobs</button>
              </div>

              <div className="settingItem">
                <h3>Default Job Search</h3>

                <input
                  placeholder="Preferred job keyword"
                  onChange={(e) =>
                    localStorage.setItem("defaultSearch", e.target.value)
                  }
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
