
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Users,
  Building2,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  X,
  UserPlus,
  UserMinus,
  CircleCheck,
  UserRound,
} from "lucide-react";

import api from "../../services/api";

import "./Teams.css";


function Teams() {

  /* =========================================================
     STATE
  ========================================================= */

  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamEmployees, setTeamEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [teamToDelete, setTeamToDelete] = useState(null);

  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
  });

  const [editTeam, setEditTeam] = useState({
    id: null,
    name: "",
    description: "",
  });

  const [selectedEmployeeId, setSelectedEmployeeId] =
    useState("");


  /* =========================================================
     FETCH TEAMS
  ========================================================= */

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/manager/teams/"
      );

      setTeams(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(
        "Failed to fetch teams:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load teams from the server."
      );

      setTeams([]);

    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     FETCH EMPLOYEES
  ========================================================= */

  const fetchEmployees = async () => {
    try {

      const response = await api.get(
        "/employees/"
      );

      setEmployees(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(
        "Failed to fetch employees:",
        err
      );

    }
  };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    fetchTeams();
    fetchEmployees();

  }, []);


  /* =========================================================
     FILTERED TEAMS
  ========================================================= */

  const filteredTeams = useMemo(() => {

    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return teams;
    }

    return teams.filter(
      (team) =>
        team.name
          ?.toLowerCase()
          .includes(value) ||
        team.description
          ?.toLowerCase()
          .includes(value) ||
        String(team.id)
          .includes(value)
    );

  }, [teams, search]);


  /* =========================================================
     SUMMARY
  ========================================================= */

  const totalTeams = teams.length;

  const totalEmployees = employees.length;

  const assignedEmployees =
    employees.filter(
      (employee) =>
        employee.team_id !== null &&
        employee.team_id !== undefined
    ).length;

  const unassignedEmployees =
    totalEmployees -
    assignedEmployees;


  /* =========================================================
     CREATE TEAM
  ========================================================= */

  const handleCreateTeam = async (event) => {

    event.preventDefault();

    if (!newTeam.name.trim()) {
      return;
    }

    try {

      setSaving(true);
      setError("");

      await api.post(
        "/manager/teams/",
        {
          name: newTeam.name.trim(),
          description:
            newTeam.description.trim() ||
            null,
        }
      );

      setNewTeam({
        name: "",
        description: "",
      });

      setShowCreateModal(false);

      await fetchTeams();

    } catch (err) {

      console.error(
        "Failed to create team:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to create team."
      );

    } finally {
      setSaving(false);
    }
  };


  /* =========================================================
     OPEN EDIT
  ========================================================= */

  const openEditModal = (team) => {

    setEditTeam({
      id: team.id,
      name: team.name || "",
      description:
        team.description || "",
    });

    setShowEditModal(true);
  };


  /* =========================================================
     UPDATE TEAM
  ========================================================= */

  const handleUpdateTeam = async (event) => {

    event.preventDefault();

    if (!editTeam.name.trim()) {
      return;
    }

    try {

      setSaving(true);
      setError("");

      await api.put(
        `/manager/teams/${editTeam.id}`,
        {
          name: editTeam.name.trim(),
          description:
            editTeam.description.trim() ||
            null,
        }
      );

      setShowEditModal(false);

      const updatedTeamId = editTeam.id;

      setEditTeam({
        id: null,
        name: "",
        description: "",
      });

      await fetchTeams();

      if (
        selectedTeam &&
        selectedTeam.id === updatedTeamId
      ) {
        await openTeamDetails(
          updatedTeamId
        );
      }

    } catch (err) {

      console.error(
        "Failed to update team:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to update team."
      );

    } finally {
      setSaving(false);
    }
  };


  /* =========================================================
     DELETE TEAM
  ========================================================= */

  const handleDeleteTeam = async () => {

    if (!teamToDelete) {
      return;
    }

    try {

      setSaving(true);
      setError("");

      await api.delete(
        `/manager/teams/${teamToDelete.id}`
      );

      if (
        selectedTeam &&
        selectedTeam.id === teamToDelete.id
      ) {
        setSelectedTeam(null);
        setTeamEmployees([]);
        setShowDetails(false);
      }

      setTeamToDelete(null);

      await fetchTeams();
      await fetchEmployees();

    } catch (err) {

      console.error(
        "Failed to delete team:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to delete team."
      );

    } finally {
      setSaving(false);
    }
  };


  /* =========================================================
     OPEN TEAM DETAILS
  ========================================================= */

  const openTeamDetails = async (teamId) => {

    try {

      setDetailLoading(true);
      setError("");

      const response =
        await api.get(
          `/manager/teams/${teamId}`
        );

      setSelectedTeam(response.data);

      setTeamEmployees(
        Array.isArray(
          response.data?.employees
        )
          ? response.data.employees
          : []
      );

      setShowDetails(true);

    } catch (err) {

      console.error(
        "Failed to load team:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load team details."
      );

    } finally {
      setDetailLoading(false);
    }
  };


  /* =========================================================
     ASSIGN EMPLOYEE
  ========================================================= */

  const handleAssignEmployee = async (event) => {

    event.preventDefault();

    if (
      !selectedTeam ||
      !selectedEmployeeId
    ) {
      return;
    }

    try {

      setSaving(true);
      setError("");

      await api.post(
        `/manager/teams/${selectedTeam.id}/employees`,
        {
          employee_id:
            Number(selectedEmployeeId),
        }
      );

      setSelectedEmployeeId("");
      setShowAssignModal(false);

      await openTeamDetails(
        selectedTeam.id
      );

      await fetchEmployees();

    } catch (err) {

      console.error(
        "Failed to assign employee:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to assign employee."
      );

    } finally {
      setSaving(false);
    }
  };


  /* =========================================================
     REMOVE EMPLOYEE
  ========================================================= */

  const handleRemoveEmployee =
    async (employeeId) => {

      if (!selectedTeam) {
        return;
      }

      try {

        setSaving(true);
        setError("");

        await api.delete(
          `/manager/teams/${selectedTeam.id}/employees/${employeeId}`
        );

        await openTeamDetails(
          selectedTeam.id
        );

        await fetchEmployees();

      } catch (err) {

        console.error(
          "Failed to remove employee:",
          err
        );

        setError(
          err.response?.data?.detail ||
          "Unable to remove employee."
        );

      } finally {
        setSaving(false);
      }
    };


  /* =========================================================
     AVAILABLE EMPLOYEES
  ========================================================= */

  const availableEmployees =
    employees.filter(
      (employee) =>
        !employee.team_id ||
        (
          selectedTeam &&
          employee.team_id ===
            selectedTeam.id
        )
    );


  /* =========================================================
     LOADING
     
     IMPORTANT:
     
     No sidebar here.
     
     App.jsx / ManagerShell owns the sidebar.
  ========================================================= */

  if (loading) {

    return (
      <div className="manager-teams-page">

        <header className="teams-header">

          <div>

            <div className="teams-header-label">
              MANAGEMENT
            </div>

            <h1>
              Teams
            </h1>

            <p>
              Organize employees into teams and manage team assignments.
            </p>

          </div>

        </header>

        <section className="teams-loading-panel">

          <RefreshCw
            size={20}
            className="teams-loading-icon"
          />

          <span>
            Loading teams...
          </span>

        </section>

      </div>
    );
  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="manager-teams-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="teams-header">

        <div>

          <div className="teams-header-label">
            MANAGEMENT
          </div>

          <h1>
            Teams
          </h1>

          <p>
            Organize employees into teams and manage team assignments.
          </p>

        </div>


        <button
          type="button"
          className="teams-create-button"
          onClick={() =>
            setShowCreateModal(true)
          }
        >

          <Plus size={17} />

          <span>
            Create Team
          </span>

        </button>

      </header>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="teams-error">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <X size={15} />
          </button>

        </div>

      )}


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <section className="teams-summary-grid">

        <div className="teams-summary-card">

          <div className="teams-summary-icon">
            <Building2 size={20} />
          </div>

          <div>

            <span>
              Total Teams
            </span>

            <strong>
              {totalTeams}
            </strong>

          </div>

        </div>


        <div className="teams-summary-card">

          <div className="teams-summary-icon">
            <Users size={20} />
          </div>

          <div>

            <span>
              Total Employees
            </span>

            <strong>
              {totalEmployees}
            </strong>

          </div>

        </div>


        <div className="teams-summary-card">

          <div className="teams-summary-icon">
            <CircleCheck size={20} />
          </div>

          <div>

            <span>
              Assigned
            </span>

            <strong>
              {assignedEmployees}
            </strong>

          </div>

        </div>


        <div className="teams-summary-card">

          <div className="teams-summary-icon">
            <UserRound size={20} />
          </div>

          <div>

            <span>
              Unassigned
            </span>

            <strong>
              {unassignedEmployees}
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          MAIN PANEL
      ===================================================== */}

      <section className="teams-panel">

        <div className="teams-panel-header">

          <div>

            <h2>
              All Teams
            </h2>

            <p>
              View, edit and manage your organization's teams.
            </p>

          </div>


          <button
            type="button"
            className="teams-refresh-button"
            onClick={() => {
              fetchTeams();
              fetchEmployees();
            }}
          >

            <RefreshCw size={15} />

            <span>
              Refresh
            </span>

          </button>

        </div>


        {/* ===================================================
            SEARCH
        =================================================== */}

        <div className="teams-filter-bar">

          <div className="teams-search">

            <Search size={16} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search teams..."
            />

          </div>

        </div>


        {/* ===================================================
            TEAM GRID
        =================================================== */}

        <div className="teams-grid">

          {filteredTeams.length === 0 ? (

            <div className="teams-empty">

              <Building2 size={30} />

              <h3>
                {teams.length === 0
                  ? "No teams yet"
                  : "No teams found"
                }
              </h3>

              <p>
                {teams.length === 0
                  ? "Create your first team to start organizing employees."
                  : "Try changing your search."
                }
              </p>

              {teams.length === 0 && (

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(true)
                  }
                >
                  <Plus size={15} />
                  Create Team
                </button>

              )}

            </div>

          ) : (

            filteredTeams.map(
              (team) => (

                <article
                  className="team-card"
                  key={team.id}
                >

                  <div className="team-card-top">

                    <div className="team-card-icon">
                      <Building2 size={20} />
                    </div>

                    <div className="team-card-actions">

                      <button
                        type="button"
                        title="View team"
                        onClick={() =>
                          openTeamDetails(
                            team.id
                          )
                        }
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        title="Edit team"
                        onClick={() =>
                          openEditModal(team)
                        }
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        title="Delete team"
                        onClick={() =>
                          setTeamToDelete(team)
                        }
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </div>


                  <div className="team-card-content">

                    <div className="team-card-id">
                      TEAM #{team.id}
                    </div>

                    <h3>
                      {team.name}
                    </h3>

                    <p>
                      {team.description ||
                        "No description provided."
                      }
                    </p>

                  </div>


                  <div className="team-card-footer">

                    <div className="team-card-members">

                      <Users size={15} />

                      <span>
                        View team members
                      </span>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openTeamDetails(
                          team.id
                        )
                      }
                    >
                      View
                    </button>

                  </div>

                </article>
              )
            )
          )}

        </div>

      </section>


      {/* =====================================================
          CREATE TEAM MODAL
      ===================================================== */}

      {showCreateModal && (

        <div
          className="teams-modal-overlay"
          onMouseDown={() =>
            setShowCreateModal(false)
          }
        >

          <div
            className="teams-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="teams-modal-header">

              <div>

                <span>
                  MANAGEMENT
                </span>

                <h2>
                  Create Team
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreateModal(false)
                }
              >
                <X size={18} />
              </button>

            </div>


            <form
              onSubmit={handleCreateTeam}
            >

              <label>
                Team Name

                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(event) =>
                    setNewTeam({
                      ...newTeam,
                      name: event.target.value,
                    })
                  }
                  placeholder="e.g. Development Team"
                  autoFocus
                />

              </label>


              <label>
                Description

                <textarea
                  value={newTeam.description}
                  onChange={(event) =>
                    setNewTeam({
                      ...newTeam,
                      description:
                        event.target.value,
                    })
                  }
                  placeholder="Describe this team..."
                  rows="4"
                />

              </label>


              <div className="teams-modal-actions">

                <button
                  type="button"
                  className="teams-modal-cancel"
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="teams-modal-primary"
                  disabled={
                    saving ||
                    !newTeam.name.trim()
                  }
                >
                  {saving
                    ? "Creating..."
                    : "Create Team"
                  }
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =====================================================
          EDIT TEAM MODAL
      ===================================================== */}

      {showEditModal && (

        <div
          className="teams-modal-overlay"
          onMouseDown={() =>
            setShowEditModal(false)
          }
        >

          <div
            className="teams-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="teams-modal-header">

              <div>

                <span>
                  MANAGEMENT
                </span>

                <h2>
                  Edit Team
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowEditModal(false)
                }
              >
                <X size={18} />
              </button>

            </div>


            <form
              onSubmit={handleUpdateTeam}
            >

              <label>
                Team Name

                <input
                  type="text"
                  value={editTeam.name}
                  onChange={(event) =>
                    setEditTeam({
                      ...editTeam,
                      name:
                        event.target.value,
                    })
                  }
                  autoFocus
                />

              </label>


              <label>
                Description

                <textarea
                  value={editTeam.description}
                  onChange={(event) =>
                    setEditTeam({
                      ...editTeam,
                      description:
                        event.target.value,
                    })
                  }
                  rows="4"
                />

              </label>


              <div className="teams-modal-actions">

                <button
                  type="button"
                  className="teams-modal-cancel"
                  onClick={() =>
                    setShowEditModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="teams-modal-primary"
                  disabled={
                    saving ||
                    !editTeam.name.trim()
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"
                  }
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      {teamToDelete && (

        <div
          className="teams-modal-overlay"
          onMouseDown={() =>
            setTeamToDelete(null)
          }
        >

          <div
            className="teams-modal teams-delete-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="teams-delete-icon">
              <Trash2 size={22} />
            </div>

            <h2>
              Delete Team?
            </h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>
                {teamToDelete.name}
              </strong>
              ? Employees in this team will not be deleted. Their team assignment will simply be removed.
            </p>


            <div className="teams-modal-actions">

              <button
                type="button"
                className="teams-modal-cancel"
                onClick={() =>
                  setTeamToDelete(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="teams-delete-confirm"
                onClick={handleDeleteTeam}
                disabled={saving}
              >
                {saving
                  ? "Deleting..."
                  : "Delete Team"
                }
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          TEAM DETAILS
      ===================================================== */}

      {showDetails && (

        <div
          className="teams-modal-overlay"
          onMouseDown={() =>
            setShowDetails(false)
          }
        >

          <div
            className="teams-details-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="teams-modal-header">

              <div>

                <span>
                  TEAM DETAILS
                </span>

                <h2>
                  {selectedTeam?.name ||
                    "Team"
                  }
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowDetails(false)
                }
              >
                <X size={18} />
              </button>

            </div>


            {detailLoading ? (

              <div className="teams-details-loading">

                <RefreshCw size={20} />

                <span>
                  Loading team...
                </span>

              </div>

            ) : (

              <>

                <div className="teams-details-description">

                  <span>
                    Description
                  </span>

                  <p>
                    {selectedTeam?.description ||
                      "No description provided."
                    }
                  </p>

                </div>


                <div className="teams-details-members-header">

                  <div>

                    <h3>
                      Team Members
                    </h3>

                    <span>
                      {teamEmployees.length}{" "}
                      employee
                      {teamEmployees.length === 1
                        ? ""
                        : "s"}
                    </span>

                  </div>


                  <button
                    type="button"
                    className="teams-assign-button"
                    onClick={() =>
                      setShowAssignModal(true)
                    }
                  >
                    <UserPlus size={15} />
                    Assign Employee
                  </button>

                </div>


                <div className="teams-members-list">

                  {teamEmployees.length === 0 ? (

                    <div className="teams-members-empty">

                      <Users size={24} />

                      <span>
                        No employees assigned to this team.
                      </span>

                    </div>

                  ) : (

                    teamEmployees.map(
                      (employee) => (

                        <div
                          className="teams-member-row"
                          key={employee.id}
                        >

                          <div className="teams-member-avatar">

                            <UserRound
                              size={18}
                            />

                          </div>


                          <div className="teams-member-info">

                            <strong>
                              {employee.name}
                            </strong>

                            <span>
                              {employee.email}
                            </span>

                          </div>


                          <div className="teams-member-role">

                            {employee.role ||
                              "Employee"}

                          </div>


                          <button
                            type="button"
                            className="teams-remove-member"
                            title="Remove from team"
                            onClick={() =>
                              handleRemoveEmployee(
                                employee.id
                              )
                            }
                            disabled={saving}
                          >

                            <UserMinus
                              size={15}
                            />

                          </button>

                        </div>

                      )
                    )

                  )}

                </div>

              </>

            )}

          </div>

        </div>

      )}


      {/* =====================================================
          ASSIGN EMPLOYEE MODAL
      ===================================================== */}

      {showAssignModal && (

        <div
          className="teams-modal-overlay teams-assign-overlay"
          onMouseDown={() =>
            setShowAssignModal(false)
          }
        >

          <div
            className="teams-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="teams-modal-header">

              <div>

                <span>
                  {selectedTeam?.name}
                </span>

                <h2>
                  Assign Employee
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAssignModal(false)
                }
              >
                <X size={18} />
              </button>

            </div>


            <form
              onSubmit={handleAssignEmployee}
            >

              <label>
                Employee

                <select
                  value={selectedEmployeeId}
                  onChange={(event) =>
                    setSelectedEmployeeId(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    Select an employee
                  </option>

                  {availableEmployees
                    .filter(
                      (employee) =>
                        employee.team_id !==
                        selectedTeam?.id
                    )
                    .map(
                      (employee) => (

                        <option
                          key={employee.id}
                          value={employee.id}
                        >
                          {employee.name} —{" "}
                          {employee.email}
                        </option>

                      )
                    )}

                </select>

              </label>


              {availableEmployees.filter(
                (employee) =>
                  employee.team_id !==
                  selectedTeam?.id
              ).length === 0 && (

                <div className="teams-no-available">

                  <Users size={17} />

                  <span>
                    No unassigned employees are available.
                  </span>

                </div>

              )}


              <div className="teams-modal-actions">

                <button
                  type="button"
                  className="teams-modal-cancel"
                  onClick={() =>
                    setShowAssignModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="teams-modal-primary"
                  disabled={
                    saving ||
                    !selectedEmployeeId
                  }
                >
                  {saving
                    ? "Assigning..."
                    : "Assign Employee"
                  }
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


export default Teams;