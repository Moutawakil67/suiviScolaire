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
                            <i class="fas fa-users fa-2x mb-2"></i>
                            <h3>{{ stats.totalStudents }}</h3>
                            <p class="mb-0">Élèves Inscrits</p>
                            <small><i class="fas fa-arrow-up"></i> +5% vs mois dernier</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card stat-card info">
                        <div class="card-body text-center">
                            <i class="fas fa-percentage fa-2x mb-2"></i>
                            <h3>{{ stats.successRate }}%</h3>
                            <p class="mb-0">Taux de Réussite</p>
                            <small><i class="fas fa-arrow-up"></i> +2.5% vs trimestre</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card stat-card warning">
                        <div class="card-body text-center">
                            <i class="fas fa-clock fa-2x mb-2"></i>
                            <h3>{{ stats.attendanceRate }}%</h3>
                            <p class="mb-0">Taux de Présence</p>
                            <small><i class="fas fa-arrow-down"></i> -1.2% cette semaine</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card stat-card danger">
                        <div class="card-body text-center">
                            <i class="fas fa-exclamation-circle fa-2x mb-2"></i>
                            <h3>{{ stats.difficultStudents }}</h3>
                            <p class="mb-0">Élèves en Difficulté</p>
                            <small><i class="fas fa-arrow-down"></i> -3 vs mois dernier</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Alertes -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="alert alert-warning alert-custom">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>Attention:</strong> Le taux d'absentéisme en Terminale C a augmenté de 15% cette semaine.
                    </div>
                </div>
            </div>

            <!-- Graphiques -->
            <div class="row">
                <div class="col-md-6">
                    <div class="chart-container">
                        <h5><i class="fas fa-chart-line me-2"></i>Évolution des Moyennes Générales</h5>
                        <canvas id="averageChart" width="400" height="200"></canvas>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="chart-container">
                        <h5><i class="fas fa-chart-pie me-2"></i>Répartition par Niveau</h5>
                        <canvas id="levelChart" width="400" height="200"></canvas>
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
                            <h6 class="card-title">Taux de Réussite BAC</h6>
                            <h3 class="text-success">{{ academicStats.bacSuccess }}%</h3>
                            <div class="progress progress-custom">
                                <div class="progress-bar bg-success" :style="{width: academicStats.bacSuccess + '%'}"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Taux de Réussite BEPC</h6>
                            <h3 class="text-info">{{ academicStats.bepcSuccess }}%</h3>
                            <div class="progress progress-custom">
                                <div class="progress-bar bg-info" :style="{width: academicStats.bepcSuccess + '%'}"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Taux de Redoublement</h6>
                            <h3 class="text-warning">{{ academicStats.repeatRate }}%</h3>
                            <div class="progress progress-custom">
                                <div class="progress-bar bg-warning" :style="{width: academicStats.repeatRate + '%'}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-8">
                    <div class="chart-container">
                        <h5>Performance par Matière</h5>
                        <canvas id="subjectChart" width="400" height="200"></canvas>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="table-custom">
                        <table class="table table-hover mb-0">
                            <thead class="table-dark">
                                <tr>
                                    <th>Niveau</th>
                                    <th>Effectif</th>
                                    <th>Moyenne</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="level in levelStats" :key="level.name">
                                    <td>{{ level.name }}</td>
                                    <td>{{ level.students }}</td>
                                    <td>
                                        <span :class="getGradeClass(level.average)">
                                            {{ level.average }}/20
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Corps Enseignant -->
        <div v-if="activeTab === 'teachers'">
            <div class="row mb-4">
                <div class="col-md-3 mb-3">
                    <div class="card">
                        <div class="card-body text-center">
                            <i class="fas fa-chalkboard-teacher fa-2x text-primary mb-2"></i>
                            <h3>{{ teacherStats.total }}</h3>
                            <p class="mb-0">Total Enseignants</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card">
                        <div class="card-body text-center">
                            <i class="fas fa-users fa-2x text-success mb-2"></i>
                            <h3>{{ teacherStats.ratio }}</h3>
                            <p class="mb-0">Élèves/Enseignant</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card">
                        <div class="card-body text-center">
                            <i class="fas fa-clock fa-2x text-info mb-2"></i>
                            <h3>{{ teacherStats.presence }}%</h3>
                            <p class="mb-0">Taux de Présence</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card">
                        <div class="card-body text-center">
                            <i class="fas fa-exchange-alt fa-2x text-warning mb-2"></i>
                            <h3>{{ teacherStats.turnover }}%</h3>
                            <p class="mb-0">Rotation Annuelle</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <div class="chart-container">
                        <h5>Répartition des Qualifications</h5>
                        <canvas id="qualificationChart" width="400" height="200"></canvas>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="table-custom">
                        <table class="table mb-0">
                            <thead class="table-dark">
                                <tr>
                                    <th>Département</th>
                                    <th>Enseignants</th>
                                    <th>Charge Moy.</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="dept in departments" :key="dept.name">
                                    <td>{{ dept.name }}</td>
                                    <td>{{ dept.teachers }}</td>
                                    <td>{{ dept.workload }}h</td>
                                    <td>
                                        <span :class="'badge ' + dept.statusClass">
                                            {{ dept.status }}
                                        </span>
                                    </td>
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
                            <p class="mb-0">Présents Aujourd'hui</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card">
                        <div class="card-body text-center">
                            <i class="fas fa-calendar-times fa-2x text-danger mb-2"></i>
                            <h3>{{ attendanceStats.absent }}</h3>
                            <p class="mb-0">Absents</p>
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
                <h5>Évolution de l'Assiduité (7 derniers jours)</h5>
                <canvas id="attendanceChart" width="400" height="200"></canvas>
            </div>
        </div>

        <!-- Discipline -->
        <div v-if="activeTab === 'discipline'">
            <div class="row mb-4">
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <div class="card-body text-center">
                            <i class="fas fa-exclamation-triangle fa-2x text-warning mb-2"></i>
                            <h3>{{ disciplineStats.incidents }}</h3>
                            <p class="mb-0">Incidents ce Mois</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <div class="card-body text-center">
                            <i class="fas fa-gavel fa-2x text-danger mb-2"></i>
                            <h3>{{ disciplineStats.sanctions }}</h3>
                            <p class="mb-0">Sanctions Appliquées</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <div class="card-body text-center">
                            <i class="fas fa-redo fa-2x text-info mb-2"></i>
                            <h3>{{ disciplineStats.recidivism }}%</h3>
                            <p class="mb-0">Taux de Récidive</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <div class="chart-container">
                        <h5>Types d'Incidents</h5>
                        <canvas id="incidentChart" width="400" height="200"></canvas>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="table-custom">
                        <table class="table mb-0">
                            <thead class="table-dark">
                                <tr>
                                    <th>Niveau</th>
                                    <th>Incidents</th>
                                    <th>Évolution</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="level in disciplineByLevel" :key="level.name">
                                    <td>{{ level.name }}</td>
                                    <td>{{ level.incidents }}</td>
                                    <td>
                                        <span :class="level.trend === 'up' ? 'text-danger' : 'text-success'">
                                            <i :class="level.trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                                            {{ level.change }}%
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
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import Chart from 'chart.js/auto'

// Données réactives
const activeTab = ref('overview')
const currentDate = ref(new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
}))

// Statistiques principales
const stats = reactive({
    totalStudents: 1247,
    successRate: 87.5,
    attendanceRate: 92.3,
    difficultStudents: 34
})

// Statistiques académiques
const academicStats = reactive({
    bacSuccess: 78.5,
    bepcSuccess: 85.2,
    repeatRate: 12.3
})

// Statistiques enseignants
const teacherStats = reactive({
    total: 67,
    ratio: 18.6,
    presence: 96.5,
    turnover: 8.2
})

// Statistiques assiduité
const attendanceStats = reactive({
    present: 92.3,
    absent: 45,
    late: 12,
    justified: 78.9
})

// Statistiques discipline
const disciplineStats = reactive({
    incidents: 23,
    sanctions: 18,
    recidivism: 15.4
})

// Données par niveau
const levelStats = reactive([
    { name: '6ème', students: 180, average: 12.5 },
    { name: '5ème', students: 175, average: 11.8 },
    { name: '4ème', students: 168, average: 12.1 },
    { name: '3ème', students: 162, average: 13.2 },
    { name: '2nde', students: 155, average: 11.6 },
    { name: '1ère', students: 148, average: 12.9 },
    { name: 'Tle', students: 142, average: 13.8 }
])

// Départements
const departments = reactive([
    { name: 'Mathématiques', teachers: 12, workload: 18, status: 'Optimal', statusClass: 'bg-success' },
    { name: 'Français', teachers: 10, workload: 20, status: 'Surchargé', statusClass: 'bg-warning' },
    { name: 'Sciences', teachers: 15, workload: 16, status: 'Optimal', statusClass: 'bg-success' },
    { name: 'Histoire-Géo', teachers: 8, workload: 22, status: 'Critique', statusClass: 'bg-danger' },
    { name: 'Langues', teachers: 11, workload: 17, status: 'Optimal', statusClass: 'bg-success' },
    { name: 'EPS', teachers: 6, workload: 24, status: 'Surchargé', statusClass: 'bg-warning' }
])

// Discipline par niveau
const disciplineByLevel = reactive([
    { name: '6ème', incidents: 3, trend: 'down', change: 25 },
    { name: '5ème', incidents: 5, trend: 'up', change: 15 },
    { name: '4ème', incidents: 7, trend: 'up', change: 40 },
    { name: '3ème', incidents: 4, trend: 'down', change: 10 },
    { name: '2nde', incidents: 2, trend: 'down', change: 50 },
    { name: '1ère', incidents: 1, trend: 'down', change: 75 },
    { name: 'Tle', incidents: 1, trend: 'down', change: 80 }
])

// Variables pour les graphiques
let charts = {}

// Propriétés calculées
const globalSatisfaction = computed(() => {
    const weights = {
        academic: 0.4,
        attendance: 0.3,
        discipline: 0.3
    }
    
    const academicScore = stats.successRate
    const attendanceScore = stats.attendanceRate
    const disciplineScore = Math.max(0, 100 - (disciplineStats.incidents * 2))
    
    return (
        academicScore * weights.academic +
        attendanceScore * weights.attendance +
        disciplineScore * weights.discipline
    ).toFixed(1)
})

const trends = computed(() => ({
    academic: stats.successRate > 85 ? 'positive' : 'negative',
    attendance: stats.attendanceRate > 90 ? 'positive' : 'negative',
    discipline: disciplineStats.incidents < 25 ? 'positive' : 'negative'
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
    stats.attendanceRate = (Math.random() * 5 + 90).toFixed(1)
    stats.difficultStudents = Math.floor(Math.random() * 10 + 30)
    
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
        teacherStats,
        attendanceStats,
        disciplineStats,
        levelStats,
        departments,
        disciplineByLevel,
        exportDate: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], {type: 'application/json'})
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dashboard_data_${new Date().toISOString().split('T')[0]}.json`
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
            message: 'Taux de présence en baisse critique'
        })
    }
    
    if (stats.difficultStudents > 40) {
        alerts.push({
            type: 'danger',
            message: 'Nombre élevé d\'élèves en difficulté'
        })
    }
    
    if (disciplineStats.incidents > 20) {
        alerts.push({
            type: 'warning',
            message: 'Augmentation des incidents disciplinaires'
        })
    }
    
    return alerts
}

const loadInitialData = () => {
    console.log('Chargement des données initiales...')
    // Simulation du chargement des données depuis une API
}

const initCharts = () => {
    // Graphique évolution des moyennes
    const avgCtx = document.getElementById('averageChart')?.getContext('2d')
    if (avgCtx) {
        charts.averageChart = new Chart(avgCtx, {
            type: 'line',
            data: {
                labels: ['Sept', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév'],
                datasets: [{
                    label: 'Moyenne Générale',
                    data: [11.2, 11.8, 12.3, 12.1, 12.6, 12.8],
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
                        max: 15
                    }
                }
            }
        })
    }

    // Graphique répartition par niveau
    const levelCtx = document.getElementById('levelChart')?.getContext('2d')
    if (levelCtx) {
        charts.levelChart = new Chart(levelCtx, {
            type: 'doughnut',
            data: {
                labels: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Tle'],
                datasets: [{
                    data: [180, 175, 168, 162, 155, 148, 142],
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                        '#9966FF', '#FF9F40', '#FF6384'
                    ]
                }]
            },
            options: {
                responsive: true
            }
        })
    }

    // Graphique performance par matière
    const subjectCtx = document.getElementById('subjectChart')?.getContext('2d')
    if (subjectCtx) {
        charts.subjectChart = new Chart(subjectCtx, {
            type: 'bar',
            data: {
                labels: ['Maths', 'Français', 'Sciences', 'Histoire', 'Anglais', 'EPS'],
                datasets: [{
                    label: 'Moyenne',
                    data: [13.2, 11.8, 12.5, 12.9, 13.1, 14.2],
                    backgroundColor: '#43e97b'
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

    // Graphique qualifications
    const qualCtx = document.getElementById('qualificationChart')?.getContext('2d')
    if (qualCtx) {
        charts.qualificationChart = new Chart(qualCtx, {
            type: 'pie',
            data: {
                labels: ['Licence', 'Master', 'Doctorat', 'CAPES', 'Agrégation'],
                datasets: [{
                    data: [15, 25, 8, 12, 7],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                }]
            }
        })
    }

    // Graphique assiduité
    const attCtx = document.getElementById('attendanceChart')?.getContext('2d')
    if (attCtx) {
        charts.attendanceChart = new Chart(attCtx, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                datasets: [{
                    label: 'Taux de Présence (%)',
                    data: [94.2, 93.8, 91.5, 92.7, 89.3, 88.1, 90.2],
                    borderColor: '#4facfe',
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Retards (%)',
                    data: [2.1, 2.8, 3.2, 2.5, 4.1, 3.7, 2.9],
                    borderColor: '#f093fb',
                    backgroundColor: 'rgba(240, 147, 251, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        })
    }

    // Graphique types d'incidents
    const incidentCtx = document.getElementById('incidentChart')?.getContext('2d')
    if (incidentCtx) {
        charts.incidentChart = new Chart(incidentCtx, {
            type: 'doughnut',
            data: {
                labels: ['Retards', 'Absences', 'Comportement', 'Matériel', 'Bagarre', 'Autres'],
                datasets: [{
                    data: [8, 5, 4, 3, 2, 1],
                    backgroundColor: [
                        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
                        '#FFEAA7', '#DDA0DD'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || ''
                                const value = context.parsed
                                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                                const percentage = ((value / total) * 100).toFixed(1)
                                return `${label}: ${value} (${percentage}%)`
                            }
                        }
                    }
                }
            }
        })
    }
}

const initSpecificCharts = (tab) => {
    switch(tab) {
        case 'academic':
            initAcademicCharts()
            break
        case 'teachers':
            initTeacherCharts()
            break
        case 'attendance':
            initAttendanceCharts()
            break
        case 'discipline':
            initDisciplineCharts()
            break
    }
}

const initAcademicCharts = () => {
    console.log('Initialisation des graphiques académiques')
}

const initTeacherCharts = () => {
    console.log('Initialisation des graphiques enseignants')
}

const initAttendanceCharts = () => {
    console.log('Initialisation des graphiques d\'assiduité')
}

const initDisciplineCharts = () => {
    console.log('Initialisation des graphiques de discipline')
}

// Watchers
watch(activeTab, (newTab) => {
    nextTick(() => {
        if (newTab !== 'overview') {
            initSpecificCharts(newTab)
        }
    })
})

// Hooks du cycle de vie
onMounted(() => {
    loadInitialData()
    
    // Délai pour s'assurer que le DOM est complètement rendu
    setTimeout(() => {
        initCharts()
    }, 100)
    
    // Mise à jour automatique des données toutes les 5 minutes
    setInterval(() => {
        refreshData()
    }, 300000)
})



// Exposer les variables et méthodes nécessaires au template
 // Exposer les variables et méthodes nécessaires au template
defineExpose({
    activeTab,
    currentDate,
    stats,
    academicStats,
    teacherStats,
    attendanceStats,
    disciplineStats,
    levelStats,
    departments,
    disciplineByLevel,
    globalSatisfaction,
    trends,
    alertLevel,
    getGradeClass,
    refreshData,
    exportData,
    filterByPeriod
})
</script>
<style scoped>
   .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            color: white;
            transition: transform 0.3s ease;
        }
        .stat-card:hover {
            transform: translateY(-5px);
        }
        .stat-card.success {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        .stat-card.warning {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        .stat-card.info {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
        .stat-card.danger {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }
        .chart-container {
            background: white;
            border-radius: 15px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 20px;
            margin-bottom: 20px;
        }
        .sidebar {
            background: linear-gradient(180deg, #2c3e50 0%, #3498db 100%);
            min-height: 100vh;
            color: white;
        }
        .sidebar .nav-link {
            color: rgba(255, 255, 255, 0.8);
            border-radius: 10px;
            margin: 5px 0;
            transition: all 0.3s ease;
        }
        .sidebar .nav-link:hover, .sidebar .nav-link.active {
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }
        .main-content {
            background: #f8f9fa;
            min-height: 100vh;
        }
        .progress-custom {
            height: 8px;
            border-radius: 4px;
        }
        .alert-custom {
            border-radius: 10px;
            border: none;
        }
        .table-custom {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
</style>
