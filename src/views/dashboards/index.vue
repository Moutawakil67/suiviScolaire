<template>
    <VerticalLayout>
   
      <b-row>
          <!-- Vue d'ensemble -->
          <div v-if="activeTab === 'overview'">
              <!-- KPI Cards -->
              <div class="row mb-4">
                  <div class="col-md-3 mb-3">
                      <div class="card stat-card success">
                          <div class="card-body text-center">
                              <i class="fas fa-graduation-cap fa-2x mb-2"></i>
                              <h3>{{ stats.childGrade }}/20</h3>
                              <p class="mb-0">Moyenne Générale</p>
                              <small><i class="fas fa-arrow-up"></i> +0.5 vs mois dernier</small>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-3 mb-3">
                      <div class="card stat-card info">
                          <div class="card-body text-center">
                              <i class="fas fa-calendar-check fa-2x mb-2"></i>
                              <h3>{{ stats.attendanceRate }}%</h3>
                              <p class="mb-0">Taux de Présence</p>
                              <small><i class="fas fa-arrow-up"></i> +2% vs trimestre</small>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-3 mb-3">
                      <div class="card stat-card warning">
                          <div class="card-body text-center">
                              <i class="fas fa-tasks fa-2x mb-2"></i>
                              <h3>{{ stats.homeworkCompletion }}%</h3>
                              <p class="mb-0">Devoirs Rendus</p>
                              <small><i class="fas fa-arrow-down"></i> -5% cette semaine</small>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-3 mb-3">
                      <div class="card stat-card danger">
                          <div class="card-body text-center">
                              <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                              <h3>{{ stats.absences }}</h3>
                              <p class="mb-0">Absences ce Mois</p>
                              <small><i class="fas fa-arrow-up"></i> +2 vs mois dernier</small>
                          </div>
                      </div>
                  </div>
              </div>
  
              <!-- Alertes -->
              <div class="row mb-4">
                  <div class="col-12">
                      <div class="alert alert-info alert-custom">
                          <i class="fas fa-info-circle me-2"></i>
                          <strong>Information:</strong> Réunion parents-professeurs prévue le 25 juin 2025 à 18h00.
                      </div>
                  </div>
              </div>
  
              <!-- Graphiques -->
              <div class="row">
                  <div class="col-md-6">
                      <div class="chart-container">
                          <h5><i class="fas fa-chart-line me-2"></i>Évolution des Notes</h5>
                          <canvas id="gradesChart" width="400" height="200"></canvas>
                      </div>
                  </div>
                  <div class="col-md-6">
                      <div class="chart-container">
                          <h5><i class="fas fa-chart-pie me-2"></i>Répartition par Matière</h5>
                          <canvas id="subjectsChart" width="400" height="200"></canvas>
                      </div>
                  </div>
              </div>
          </div>
  
          <!-- Performance Académique -->
          <div v-if="activeTab === 'academic'">
              <div class="row mb-4">
                  <div class="col-md-4 mb-3">
                      <div class="card">
                          <div class="card-body">
                              <h6 class="card-title">Moyenne Générale</h6>
                              <h3 class="text-success">{{ academicStats.generalAverage }}/20</h3>
                              <div class="progress progress-custom">
                                  <div class="progress-bar bg-success" :style="{width: (academicStats.generalAverage / 20 * 100) + '%'}"></div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-4 mb-3">
                      <div class="card">
                          <div class="card-body">
                              <h6 class="card-title">Classement</h6>
                              <h3 class="text-info">{{ academicStats.classRank }}e</h3>
                              <div class="progress progress-custom">
                                  <div class="progress-bar bg-info" :style="{width: Math.max(5, 100 - (academicStats.classRank / academicStats.totalStudents * 100)) + '%'}"></div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-4 mb-3">
                      <div class="card">
                          <div class="card-body">
                              <h6 class="card-title">Appréciation</h6>
                              <h3 class="text-primary">{{ academicStats.appreciation }}</h3>
                              <small class="text-muted">Conseil de classe</small>
                          </div>
                      </div>
                  </div>
              </div>
  
              <div class="row">
                  <div class="col-md-8">
                      <div class="chart-container">
                          <h5>Notes par Matière</h5>
                          <canvas id="subjectGradesChart" width="400" height="200"></canvas>
                      </div>
                  </div>
                  <div class="col-md-4">
                      <div class="table-custom">
                          <table class="table table-hover mb-0">
                              <thead class="table-dark">
                                  <tr>
                                      <th>Matière</th>
                                      <th>Note</th>
                                      <th>Coeff</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr v-for="subject in subjectGrades" :key="subject.name">
                                      <td>{{ subject.name }}</td>
                                      <td>
                                          <span :class="getGradeClass(subject.grade)">
                                              {{ subject.grade }}/20
                                          </span>
                                      </td>
                                      <td>{{ subject.coefficient }}</td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          </div>
  
          <!-- Assiduité -->
          <div v-if="activeTab === 'attendance'">
              <div class="row mb-4">
                  <div class="col-md-3 mb-3">
                      <div class="card">
                          <div class="card-body text-center">
                              <i class="fas fa-calendar-check fa-2x text-success mb-2"></i>
                              <h3>{{ attendanceStats.present }}%</h3>
                              <p class="mb-0">Présence ce Mois</p>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-3 mb-3">
                      <div class="card">
                          <div class="card-body text-center">
                              <i class="fas fa-calendar-times fa-2x text-danger mb-2"></i>
                              <h3>{{ attendanceStats.absent }}</h3>
                              <p class="mb-0">Absences</p>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-3 mb-3">
                      <div class="card">
                          <div class="card-body text-center">
                              <i class="fas fa-clock fa-2x text-warning mb-2"></i>
                              <h3>{{ attendanceStats.late }}</h3>
                              <p class="mb-0">Retards</p>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-3 mb-3">
                      <div class="card">
                          <div class="card-body text-center">
                              <i class="fas fa-file-medical fa-2x text-info mb-2"></i>
                              <h3>{{ attendanceStats.justified }}%</h3>
                              <p class="mb-0">Absences Justifiées</p>
                          </div>
                      </div>
                  </div>
              </div>
  
              <div class="chart-container">
                  <h5>Évolution de la Présence (30 derniers jours)</h5>
                  <canvas id="attendanceChart" width="400" height="200"></canvas>
              </div>
  
              <div class="row mt-4">
                  <div class="col-12">
                      <div class="table-custom">
                          <table class="table mb-0">
                              <thead class="table-dark">
                                  <tr>
                                      <th>Date</th>
                                      <th>Cours</th>
                                      <th>Statut</th>
                                      <th>Justification</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr v-for="record in attendanceRecords" :key="record.id">
                                      <td>{{ record.date }}</td>
                                      <td>{{ record.subject }}</td>
                                      <td>
                                          <span :class="'badge ' + record.statusClass">
                                              {{ record.status }}
                                          </span>
                                      </td>
                                      <td>{{ record.justification }}</td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          </div>
  
          <!-- Devoirs et Notes -->
          <div v-if="activeTab === 'homework'">
              <div class="row mb-4">
                  <div class="col-md-4 mb-3">
                      <div class="card">
                          <div class="card-body text-center">
                              <i class="fas fa-clipboard-list fa-2x text-primary mb-2"></i>
                              <h3>{{ homeworkStats.total }}</h3>
                              <p class="mb-0">Devoirs ce Mois</p>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-4 mb-3">
                      <div class="card">
                          <div class="card-body text-center">
                              <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
                              <h3>{{ homeworkStats.completed }}</h3>
                              <p class="mb-0">Devoirs Rendus</p>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-4 mb-3">
                      <div class="card">
                          <div class="card-body text-center">
                              <i class="fas fa-hourglass-half fa-2x text-warning mb-2"></i>
                              <h3>{{ homeworkStats.pending }}</h3>
                              <p class="mb-0">En Attente</p>
                          </div>
                      </div>
                  </div>
              </div>
  
              <div class="row">
                  <div class="col-md-6">
                      <div class="chart-container">
                          <h5>Devoirs par Matière</h5>
                          <canvas id="homeworkChart" width="400" height="200"></canvas>
                      </div>
                  </div>
                  <div class="col-md-6">
                      <div class="table-custom">
                          <h5 class="p-3 mb-0">Devoirs à Venir</h5>
                          <table class="table mb-0">
                              <thead class="table-light">
                                  <tr>
                                      <th>Date</th>
                                      <th>Matière</th>
                                      <th>Type</th>
                                      <th>Statut</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr v-for="homework in upcomingHomework" :key="homework.id">
                                      <td>{{ homework.dueDate }}</td>
                                      <td>{{ homework.subject }}</td>
                                      <td>{{ homework.type }}</td>
                                      <td>
                                          <span :class="'badge ' + homework.statusClass">
                                              {{ homework.status }}
                                          </span>
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          </div>
  
          <!-- Communication -->
          <div v-if="activeTab === 'communication'">
              <div class="row mb-4">
                  <div class="col-md-3 mb-3">
                      <div class="card">
                          <div class="card-body text-center">
                              <i class="fas fa-envelope fa-2x text-primary mb-2"></i>
                              <h3>{{ communicationStats.messages }}</h3>
                              <p class="mb-0">Messages Reçus</p>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-3 mb-3">
                      <div class="card">
                          <div class="card-body text-center">
                              <i class="fas fa-bullhorn fa-2x text-info mb-2"></i>
                              <h3>{{ communicationStats.announcements }}</h3>
                              <p class="mb-0">Annonces</p>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-3 mb-3">
                      <div class="card">
                          <div class="card-body text-center">
                              <i class="fas fa-calendar-alt fa-2x text-success mb-2"></i>
                              <h3>{{ communicationStats.events }}</h3>
                              <p class="mb-0">Événements</p>
                          </div>
                      </div>
                  </div>
                  <div class="col-md-3 mb-3">
                      <div class="card">
                          <div class="card-body text-center">
                              <i class="fas fa-users fa-2x text-warning mb-2"></i>
                              <h3>{{ communicationStats.meetings }}</h3>
                              <p class="mb-0">RDV Planifiés</p>
                          </div>
                      </div>
                  </div>
              </div>
  
              <div class="row">
                  <div class="col-md-6">
                      <div class="table-custom">
                          <h5 class="p-3 mb-0">Messages Récents</h5>
                          <table class="table mb-0">
                              <thead class="table-light">
                                  <tr>
                                      <th>Date</th>
                                      <th>Expéditeur</th>
                                      <th>Sujet</th>
                                      <th>Statut</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr v-for="message in recentMessages" :key="message.id">
                                      <td>{{ message.date }}</td>
                                      <td>{{ message.sender }}</td>
                                      <td>{{ message.subject }}</td>
                                      <td>
                                          <span :class="'badge ' + message.statusClass">
                                              {{ message.status }}
                                          </span>
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  </div>
                  <div class="col-md-6">
                      <div class="table-custom">
                          <h5 class="p-3 mb-0">Événements à Venir</h5>
                          <table class="table mb-0">
                              <thead class="table-light">
                                  <tr>
                                      <th>Date</th>
                                      <th>Événement</th>
                                      <th>Type</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr v-for="event in upcomingEvents" :key="event.id">
                                      <td>{{ event.date }}</td>
                                      <td>{{ event.title }}</td>
                                      <td>
                                          <span :class="'badge ' + event.typeClass">
                                              {{ event.type }}
                                          </span>
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          </div>
                   
      </b-row>
    </VerticalLayout>
  </template>
  
  <script lang="ts" setup>
  import VerticalLayout from '@/layouts/VerticalLayout.vue';
  import { ref, reactive, computed, watch, onMounted,onUnmounted , nextTick } from 'vue'
  import Chart from 'chart.js/auto'
  
  // Données réactives
  const activeTab = ref('overview')
  const currentDate = ref(new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
  }))
  
  // Statistiques principales pour le parent
  const stats = reactive({
      childGrade: 13.2,
      attendanceRate: 96.5,
      homeworkCompletion: 85.0,
      absences: 3
  })
  
  // Statistiques académiques de l'enfant
  const academicStats = reactive({
      generalAverage: 13.2,
      classRank: 8,
      totalStudents: 28,
      appreciation: 'Bien'
  })
  
  // Statistiques assiduité de l'enfant
  const attendanceStats = reactive({
      present: 96.5,
      absent: 3,
      late: 2,
      justified: 66.7
  })
  
  // Statistiques devoirs
  const homeworkStats = reactive({
      total: 24,
      completed: 20,
      pending: 4
  })
  
  // Statistiques communication
  const communicationStats = reactive({
      messages: 12,
      announcements: 5,
      events: 3,
      meetings: 2
  })
  
  // Notes par matière
  const subjectGrades = reactive([
      { name: 'Mathématiques', grade: 14.5, coefficient: 4 },
      { name: 'Français', grade: 12.8, coefficient: 4 },
      { name: 'Anglais', grade: 15.2, coefficient: 3 },
      { name: 'Histoire-Géo', grade: 11.9, coefficient: 3 },
      { name: 'Sciences', grade: 13.1, coefficient: 3 },
      { name: 'EPS', grade: 16.0, coefficient: 2 }
  ])
  
  // Historique d'assiduité
  const attendanceRecords = reactive([
      { id: 1, date: '18/06/2025', subject: 'Mathématiques', status: 'Absent', statusClass: 'bg-danger', justification: 'Maladie' },
      { id: 2, date: '17/06/2025', subject: 'Français', status: 'Présent', statusClass: 'bg-success', justification: '-' },
      { id: 3, date: '16/06/2025', subject: 'Anglais', status: 'Retard', statusClass: 'bg-warning', justification: 'Transport' },
      { id: 4, date: '15/06/2025', subject: 'Histoire', status: 'Présent', statusClass: 'bg-success', justification: '-' },
      { id: 5, date: '14/06/2025', subject: 'Sciences', status: 'Présent', statusClass: 'bg-success', justification: '-' }
  ])
  
  // Devoirs à venir
  const upcomingHomework = reactive([
      { id: 1, dueDate: '22/06/2025', subject: 'Mathématiques', type: 'Devoir', status: 'À faire', statusClass: 'bg-warning' },
      { id: 2, dueDate: '23/06/2025', subject: 'Français', type: 'Rédaction', status: 'En cours', statusClass: 'bg-info' },
      { id: 3, dueDate: '24/06/2025', subject: 'Anglais', type: 'Exposé', status: 'Terminé', statusClass: 'bg-success' },
      { id: 4, dueDate: '25/06/2025', subject: 'Histoire', type: 'Recherche', status: 'À faire', statusClass: 'bg-warning' }
  ])
  
  // Messages récents
  const recentMessages = reactive([
      { id: 1, date: '19/06/2025', sender: 'Prof. Martin', subject: 'Résultats devoir maths', status: 'Nouveau', statusClass: 'bg-primary' },
      { id: 2, date: '18/06/2025', sender: 'CPE', subject: 'Absence justifiée', status: 'Lu', statusClass: 'bg-secondary' },
      { id: 3, date: '17/06/2025', sender: 'Directeur', subject: 'Réunion parents', status: 'Lu', statusClass: 'bg-secondary' },
      { id: 4, date: '16/06/2025', sender: 'Prof. Dupont', subject: 'Félicitations', status: 'Lu', statusClass: 'bg-secondary' }
  ])
  
  // Événements à venir
  const upcomingEvents = reactive([
      { id: 1, date: '25/06/2025', title: 'Réunion parents-professeurs', type: 'Réunion', typeClass: 'bg-info' },
      { id: 2, date: '28/06/2025', title: 'Remise des bulletins', type: 'Administratif', typeClass: 'bg-success' },
      { id: 3, date: '30/06/2025', title: 'Spectacle de fin d\'année', type: 'Événement', typeClass: 'bg-warning' }
  ])
  
  // Variables pour les graphiques
  let charts = {}
  
  // Propriétés calculées
  const globalSatisfaction = computed(() => {
      const weights = {
          academic: 0.4,
          attendance: 0.3,
          homework: 0.3
      }
      
      const academicScore = (stats.childGrade / 20) * 100
      const attendanceScore = stats.attendanceRate
      const homeworkScore = stats.homeworkCompletion
      
      return (
          academicScore * weights.academic +
          attendanceScore * weights.attendance +
          homeworkScore * weights.homework
      ).toFixed(1)
  })
  
  const trends = computed(() => ({
      academic: stats.childGrade > 12 ? 'positive' : 'negative',
      attendance: stats.attendanceRate > 90 ? 'positive' : 'negative',
      homework: stats.homeworkCompletion > 80 ? 'positive' : 'negative'
  }))
  
  const alertLevel = computed(() => {
      const alerts = getAlerts()
      if (alerts.some(alert => alert.type === 'danger')) return 'danger'
      if (alerts.some(alert => alert.type === 'warning')) return 'warning'
      return 'success'
  })
  
  // Méthodes
  const getGradeClass = (grade) => {
      if (grade >= 14) return 'text-success fw-bold'
      if (grade >= 10) return 'text-warning fw-bold'
      return 'text-danger fw-bold'
  }
  
  const refreshData = () => {
      // Simulation de mise à jour des données
      stats.attendanceRate = (Math.random() * 5 + 92).toFixed(1)
      stats.homeworkCompletion = (Math.random() * 10 + 80).toFixed(1)
      
      updateCharts()
  }
  
  const updateCharts = () => {
      console.log('Mise à jour des graphiques...')
      // Logique de mise à jour des graphiques
  }
  
  const exportData = () => {
      const data = {
          stats,
          academicStats,
          attendanceStats,
          homeworkStats,
          communicationStats,
          subjectGrades,
          attendanceRecords,
          upcomingHomework,
          recentMessages,
          upcomingEvents,
          exportDate: new Date().toISOString()
      }
      
      const dataStr = JSON.stringify(data, null, 2)
      const dataBlob = new Blob([dataStr], {type: 'application/json'})
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `dashboard_parent_${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
  }
  
  const filterByPeriod = (period) => {
      console.log(`Filtrage par période: ${period}`)
      // Logique de filtrage par période
  }
  
  const getAlerts = () => {
      const alerts = []
      
      if (stats.attendanceRate < 90) {
          alerts.push({
              type: 'warning',
              message: 'Taux de présence de votre enfant en baisse'
          })
      }
      
      if (stats.homeworkCompletion < 70) {
          alerts.push({
              type: 'danger',
              message: 'Retard dans les devoirs'
          })
      }
      
      if (stats.absences > 5) {
          alerts.push({
              type: 'warning',
              message: 'Nombre d\'absences élevé ce mois'
          })
      }
      
      return alerts
  }
  
  const loadInitialData = () => {
      console.log('Chargement des données de l\'enfant...')
      // Simulation du chargement des données depuis une API
  }
  
  const initCharts = () => {
      // Graphique évolution des notes
      const gradesCtx = document.getElementById('gradesChart')?.getContext('2d')
      if (gradesCtx) {
          charts.gradesChart = new Chart(gradesCtx, {
              type: 'line',
              data: {
                  labels: ['Sept', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév'],
                  datasets: [{
                      label: 'Moyenne Générale',
                      data: [12.1, 12.5, 13.0, 12.8, 13.1, 13.2],
                      borderColor: '#667eea',
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      tension: 0.4
                  }]
              },
              options: {
                  responsive: true,
                  scales: {
                      y: {
                          beginAtZero: false,
                          min: 10,
                          max: 16
                      }
                  }
              }
          })
      }
  
      // Graphique répartition par matière
      const subjectsCtx = document.getElementById('subjectsChart')?.getContext('2d')
      if (subjectsCtx) {
          charts.subjectsChart = new Chart(subjectsCtx, {
              type: 'doughnut',
              data: {
                  labels: ['Maths', 'Français', 'Anglais', 'Histoire', 'Sciences', 'EPS'],
                  datasets: [{
                      data: [14.5, 12.8, 15.2, 11.9, 13.1, 16.0],
                      backgroundColor: [
                          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                          '#9966FF', '#FF9F40'
                      ]
                  }]
              },
              options: {
                  responsive: true
              }
          })
      }
  
      // Graphique notes par matière
      const subjectGradesCtx = document.getElementById('subjectGradesChart')?.getContext('2d')
      if (subjectGradesCtx) {
          charts.subjectGradesChart = new Chart(subjectGradesCtx, {
              type: 'bar',
              data: {
                  labels: ['Maths', 'Français', 'Anglais', 'Histoire', 'Sciences', 'EPS'],
                  datasets: [{
                      label: 'Note',
                      data: [14.5, 12.8, 15.2, 11.9, 13.1, 16.0],
                      backgroundColor: '#43e97b'
                  }]
              },
              options: {
                  responsive: true,
                  scales: {
                      y: {
                          beginAtZero: false,
                          min: 8,
                          max: 18
                      }
                  }
              }
          })
      }
  
     // Graphique assiduité
const attCtx = document.getElementById('attendanceChart')?.getContext('2d')
if (attCtx) {
    charts.attendanceChart = new Chart(attCtx, {
        type: 'line',
        data: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
            datasets: [{
                label: 'Présence (%)',
                data: [98.5, 97.2, 96.8, 95.1, 96.5, 97.0],
                borderColor: '#4facfe',
                backgroundColor: 'rgba(79, 172, 254, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 3,
                pointBackgroundColor: '#4facfe',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }, {
                label: 'Moyenne Classe (%)',
                data: [94.2, 93.8, 94.5, 93.1, 94.8, 95.2],
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderDash: [5, 5],
                tension: 0.4,
                fill: false,
                borderWidth: 2,
                pointBackgroundColor: '#ff6b6b',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Évolution de la Présence (6 dernières semaines)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#2c3e50'
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#4facfe',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        title: function(tooltipItems) {
                            return `Semaine ${tooltipItems[0].dataIndex + 1}`
                        },
                        label: function(context) {
                            const label = context.dataset.label || ''
                            const value = context.parsed.y
                            return `${label}: ${value}%`
                        },
                        afterBody: function(tooltipItems) {
                            const studentValue = tooltipItems.find(item => item.dataset.label.includes('Présence'))?.parsed.y
                            const classValue = tooltipItems.find(item => item.dataset.label.includes('Moyenne'))?.parsed.y
                            
                            if (studentValue && classValue) {
                                const diff = (studentValue - classValue).toFixed(1)
                                const status = diff > 0 ? 'au-dessus' : 'en-dessous'
                                return [`Écart: ${Math.abs(diff)}% ${status} de la moyenne classe`]
                            }
                            return []
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Période',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#2c3e50'
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            size: 12
                        }
                    }
                },
                y: {
                    display: true,
                    beginAtZero: false,
                    min: 90,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Taux de Présence (%)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#2c3e50'
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            size: 12
                        },
                        stepSize: 2,
                        callback: function(value) {
                            return value + '%'
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            elements: {
                line: {
                    tension: 0.4
                }
            }
        }
    })
}



    // Graphique devoirs par matière
    const homeworkCtx = document.getElementById('homeworkChart')?.getContext('2d')
    if (homeworkCtx) {
        charts.homeworkChart = new Chart(homeworkCtx, {
            type: 'bar',
            data: {
                labels: ['Maths', 'Français', 'Anglais', 'Histoire', 'Sciences', 'EPS'],
                datasets: [{
                    label: 'Devoirs ce mois',
                    data: [6, 5, 4, 3, 4, 2],
                    backgroundColor: '#f093fb'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        })
    }
}

// Watchers
watch(activeTab, (newTab) => {
    console.log(`Onglet actif changé vers: ${newTab}`)
    nextTick(() => {
        if (newTab === 'overview') {
            initCharts()
        } else if (newTab === 'academic') {
            // Initialiser les graphiques académiques
            const subjectGradesCtx = document.getElementById('subjectGradesChart')?.getContext('2d')
            if (subjectGradesCtx && !charts.subjectGradesChart) {
                charts.subjectGradesChart = new Chart(subjectGradesCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Maths', 'Français', 'Anglais', 'Histoire', 'Sciences', 'EPS'],
                        datasets: [{
                            label: 'Note',
                            data: [14.5, 12.8, 15.2, 11.9, 13.1, 16.0],
                            backgroundColor: '#43e97b'
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: false,
                                min: 8,
                                max: 18
                            }
                        }
                    }
                })
            }
        } else if (newTab === 'attendance') {
            // Initialiser le graphique d'assiduité
            const attCtx = document.getElementById('attendanceChart')?.getContext('2d')
            if (attCtx && !charts.attendanceChart) {
                charts.attendanceChart = new Chart(attCtx, {
                    type: 'line',
                    data: {
                        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
                        datasets: [{
                            label: 'Présence (%)',
                            data: [98.5, 97.2, 96.8, 95.1, 96.5, 97.0],
                            borderColor: '#4facfe',
                            backgroundColor: 'rgba(79, 172, 254, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: false,
                                min: 90,
                                max: 100
                            }
                        }
                    }
                })
            }
        } else if (newTab === 'homework') {
            // Initialiser le graphique des devoirs
            const homeworkCtx = document.getElementById('homeworkChart')?.getContext('2d')
            if (homeworkCtx && !charts.homeworkChart) {
                charts.homeworkChart = new Chart(homeworkCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Maths', 'Français', 'Anglais', 'Histoire', 'Sciences', 'EPS'],
                        datasets: [{
                            label: 'Devoirs ce mois',
                            data: [6, 5, 4, 3, 4, 2],
                            backgroundColor: '#f093fb'
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                })
            }
        }
    })
})

// Lifecycle hooks
onMounted(() => {
    loadInitialData()
    nextTick(() => {
        initCharts()
    })
})

// Méthodes supplémentaires
const getNotificationCount = () => {
    return recentMessages.filter(msg => msg.status === 'Nouveau').length
}

const markMessageAsRead = (messageId) => {
    const message = recentMessages.find(msg => msg.id === messageId)
    if (message) {
        message.status = 'Lu'
        message.statusClass = 'bg-secondary'
    }
}

const scheduleParentMeeting = () => {
    console.log('Planification d\'un rendez-vous parent-professeur')
    // Logique pour planifier un rendez-vous
}

const downloadBulletin = () => {
    console.log('Téléchargement du bulletin scolaire')
    // Logique pour télécharger le bulletin
}

const generateProgressReport = () => {
    const report = {
        student: {
            name: 'Nom de l\'élève',
            class: '5ème A',
            period: 'Trimestre 2 - 2024/2025'
        },
        overview: {
            generalAverage: academicStats.generalAverage,
            classRank: academicStats.classRank,
            totalStudents: academicStats.totalStudents,
            attendance: attendanceStats.present,
            homeworkCompletion: stats.homeworkCompletion
        },
        subjects: subjectGrades,
        trends: {
            academic: trends.value.academic,
            attendance: trends.value.attendance,
            homework: trends.value.homework
        },
        recommendations: getRecommendations(),
        generatedAt: new Date().toISOString()
    }
    
    console.log('Rapport de progression généré:', report)
    return report
}

const getRecommendations = () => {
    const recommendations = []
    
    if (stats.childGrade < 12) {
        recommendations.push('Envisager un soutien scolaire en mathématiques et français')
    }
    
    if (stats.attendanceRate < 95) {
        recommendations.push('Améliorer la régularité de présence en cours')
    }
    
    if (stats.homeworkCompletion < 85) {
        recommendations.push('Mettre en place un planning de travail à domicile')
    }
    
    const weakSubjects = subjectGrades.filter(subject => subject.grade < 12)
    if (weakSubjects.length > 0) {
        recommendations.push(`Renforcer le travail en: ${weakSubjects.map(s => s.name).join(', ')}`)
    }
    
    return recommendations
}

const calculateAttendanceTrend = () => {
    const recentAttendance = [98.5, 97.2, 96.8, 95.1, 96.5, 97.0]
    const average = recentAttendance.reduce((a, b) => a + b, 0) / recentAttendance.length
    const trend = recentAttendance[recentAttendance.length - 1] - average
    
    return {
        average: average.toFixed(1),
        trend: trend > 0 ? 'positive' : 'negative',
        value: Math.abs(trend).toFixed(1)
    }
}

const getSubjectRecommendations = (subjectName) => {
    const subject = subjectGrades.find(s => s.name === subjectName)
    if (!subject) return []
    
    const recommendations = []
    
    if (subject.grade < 10) {
        recommendations.push('Urgent: prévoir un soutien immédiat')
        recommendations.push('Prendre rendez-vous avec le professeur')
    } else if (subject.grade < 12) {
        recommendations.push('Revoir les bases et faire des exercices supplémentaires')
        recommendations.push('Participer davantage en cours')
    } else if (subject.grade >= 15) {
        recommendations.push('Excellent niveau - maintenir l\'effort')
        recommendations.push('Possibilité d\'approfondir la matière')
    }
    
    return recommendations
}

// Export des fonctions et variables pour utilisation externe
const dashboardMethods = {
    refreshData,
    exportData,
    filterByPeriod,
    generateProgressReport,
    scheduleParentMeeting,
    downloadBulletin,
    markMessageAsRead,
    getNotificationCount,
    getSubjectRecommendations
}

// Données à exporter
const dashboardData = {
    stats,
    academicStats,
    attendanceStats,
    homeworkStats,
    communicationStats,
    subjectGrades,
    attendanceRecords,
    upcomingHomework,
    recentMessages,
    upcomingEvents,
    activeTab,
    currentDate
}

// Nettoyage lors de la destruction du composant
onUnmounted(() => {
    // Détruire tous les graphiques pour éviter les fuites mémoire
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy()
        }
    })
    charts = {}
})

// Interface pour l'API parent
const parentAPI = {
    // Récupérer les données de l'enfant
    getChildData: () => dashboardData,
    
    // Actualiser les données
    refresh: refreshData,
    
    // Exporter les données
    export: exportData,
    
    // Obtenir les alertes
    getAlerts,
    
    // Obtenir les recommandations
    getRecommendations,
    
    // Calculer la satisfaction globale
    getGlobalSatisfaction: () => globalSatisfaction.value,
    
    // Obtenir les tendances
    getTrends: () => trends.value
}

// Exposer l'API pour les tests ou l'intégration
if (typeof window !== 'undefined') {
    window.parentDashboardAPI = parentAPI
}

</script>