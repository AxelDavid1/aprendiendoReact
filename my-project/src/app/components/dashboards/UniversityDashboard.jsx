import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import CredencialesCursos from "../modules/CredencialesCursos";

const API_URL_USERS = "/api/users"; // Assuming this endpoint exists

function UniversityDashboard({ userId }) {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [userUniversityId, setUserUniversityId] = useState(null);

  useEffect(() => {
    // Mock API call to fetch teachers and courses
    setTeachers([
      { id: 1, name: "Dr. Smith" },
      { id: 2, name: "Prof. Jones" },
    ]);
    setCourses([
      { id: 1, title: "Intro to Programming" },
      { id: 2, title: "Data Science Basics" },
    ]);
    // Replace with API calls: fetch(`/api/universities/${userId}/teachers`), fetch(`/api/universities/${userId}/courses`)
  }, [userId]);

  useEffect(() => {
    const fetchUserUniversity = async () => {
      if (userId) {
        try {
          const response = await fetch(`${API_URL_USERS}/${userId}`);
          if (response.ok) {
            const userData = await response.json();
            if (userData && userData.id_universidad) {
              setUserUniversityId(userData.id_universidad.toString());
            }
          }
        } catch (error) {
          console.error("Error fetching user university ID:", error);
        }
      }
    };
    fetchUserUniversity();
  }, [userId]);

  return (
    <div className={styles.todo}>
      <div className={styles.modulos}>
        <h1>Credenciales</h1>
        <section>
          <CredencialesCursos userId={userId} canEdit={true} dashboardType="sedeq" />
        </section>
      </div>
      <div className={styles.modulos}>
        <h1>Credenciales</h1>
        <section>
          {userUniversityId && (
            <CredencialesCursos
              userId={userId}
              dashboardType="university"
              userUniversityId={userUniversityId}
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default UniversityDashboard;