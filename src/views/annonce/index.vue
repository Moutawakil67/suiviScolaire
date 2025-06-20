<template>
  <VerticalLayout>
    <div class="container-fluid">
      <PageTitle title="Annonces de l'École" />

      <!-- Barre de recherche et filtres -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-6">
          <SearchBox
            v-model="searchQuery"
            placeholder="Rechercher une annonce..."
            class="w-100"
          />
        </div>
        <div class="col-12 col-md-6 d-flex justify-content-md-end justify-content-center gap-2">
          <select 
            v-model="selectedFilter" 
            class="form-select" 
            style="max-width: 200px;"
          >
            <option value="">Toutes les annonces</option>
            <option value="recent">Récentes (7 jours)</option>
            <option value="thisMonth">Ce mois</option>
            <option value="important">Importantes</option>
          </select>
        </div>
      </div>

      <!-- Compteur d'annonces -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="alert alert-info d-flex align-items-center">
            <i class="bx bx-info-circle me-2"></i>
            <span>{{ filteredAnnonces.length }} annonce(s) disponible(s)</span>
          </div>
        </div>
      </div>

      <!-- Liste des annonces en cartes -->
      <div class="row">
        <div 
          v-for="annonce in paginatedAnnonces" 
          :key="annonce.id"
          class="col-12 col-lg-6 col-xl-4 mb-4"
        >
          <div class="card h-100 shadow-sm annonce-card border-0">
            <!-- Badge de priorité -->
            <div class="position-absolute top-0 end-0 m-2" v-if="annonce.priorite === 'haute'">
              <span class="badge bg-danger">
                <i class="bx bx-star me-1"></i>Important
              </span>
            </div>

            <!-- Image de l'annonce -->
            <div 
              v-if="annonce.images_annonce && annonce.images_annonce.length > 0"
              class="card-img-top-container position-relative"
            >
              <img 
                :src="annonce.images_annonce[0]" 
                class="card-img-top"
                :alt="annonce.titre_annonce"
                style="height: 200px; object-fit: cover;"
              />
              <div class="position-absolute bottom-0 end-0 m-2" v-if="annonce.images_annonce.length > 1">
                <span class="badge bg-dark bg-opacity-75">
                  <i class="bx bx-images me-1"></i>{{ annonce.images_annonce.length }}
                </span>
              </div>
            </div>

            <div class="card-body d-flex flex-column">
              <!-- Titre et date -->
              <div class="mb-2">
                <h5 class="card-title mb-1">{{ annonce.titre_annonce }}</h5>
                <small class="text-muted">
                  <i class="bx bx-calendar me-1"></i>
                  {{ formatDate(annonce.date_annonce) }}
                </small>
              </div>

              <!-- Aperçu du contenu -->
              <div class="card-text flex-grow-1 mb-3">
                <div v-html="truncateText(annonce.contenu_annonce, 120)"></div>
              </div>

              <!-- Documents attachés -->
              <div class="mb-3" v-if="annonce.documents && annonce.documents.length > 0">
                <small class="text-muted d-block mb-2">
                  <i class="bx bx-paperclip me-1"></i>
                  {{ annonce.documents.length }} document(s) attaché(s)
                </small>
                <div class="d-flex flex-wrap gap-1">
                  <button
                    v-for="(doc, index) in annonce.documents"
                    :key="index"
                    class="btn btn-sm btn-outline-primary"
                    @click="downloadDocument(doc)"
                    :disabled="downloadingDocs[doc.id]"
                  >
                    <span v-if="downloadingDocs[doc.id]" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="bx bx-download me-1"></i>
                    {{ doc.nom }}
                  </button>
                </div>
              </div>

              <!-- Actions -->
              <div class="mt-auto d-flex justify-content-between align-items-center">
                <div class="d-flex gap-2">
                  <button 
                    class="btn btn-primary btn-sm"
                    @click="viewFullAnnonce(annonce)"
                  >
                    <i class="bx bx-show me-1"></i>
                    Lire
                  </button>
                  <button 
                    class="btn btn-outline-secondary btn-sm"
                    @click="shareAnnonce(annonce)"
                  >
                    <i class="bx bx-share me-1"></i>
                    Partager
                  </button>
                </div>
                
                <!-- Indicateur de nouveau -->
                <span v-if="isNew(annonce)" class="badge bg-success">
                  <i class="bx bx-star me-1"></i>Nouveau
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Message si aucune annonce -->
        <div v-if="filteredAnnonces.length === 0" class="col-12">
          <div class="text-center py-5">
            <i class="bx bx-info-circle display-4 text-muted"></i>
            <h5 class="text-muted mt-3">Aucune annonce trouvée</h5>
            <p class="text-muted">Aucune annonce ne correspond à vos critères de recherche.</p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="row mt-4" v-if="totalPages > 1">
        <div class="col-12">
          <nav aria-label="Navigation des annonces">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage = Math.max(1, currentPage - 1)">
                  <i class="bx bx-chevron-left"></i>
                </button>
              </li>
              
              <li 
                v-for="page in visiblePages" 
                :key="page"
                class="page-item" 
                :class="{ active: page === currentPage }"
              >
                <button class="page-link" @click="currentPage = page">
                  {{ page }}
                </button>
              </li>
              
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="currentPage = Math.min(totalPages, currentPage + 1)">
                  <i class="bx bx-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal de détail de l'annonce -->
    <div class="modal fade" id="annonceDetailModal" tabindex="-1" ref="detailModal">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedAnnonce?.titre_annonce }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          
          <div class="modal-body" v-if="selectedAnnonce">
            <!-- Informations de l'annonce -->
            <div class="row mb-3">
              <div class="col-md-6">
                <small class="text-muted">Date de publication</small>
                <p class="mb-0">{{ formatDate(selectedAnnonce.date_annonce) }}</p>
              </div>
              <div class="col-md-6" v-if="selectedAnnonce.created_by">
                <small class="text-muted">Publié par</small>
                <p class="mb-0">{{ `${selectedAnnonce.created_by.prenom} ${selectedAnnonce.created_by.nom}` }}</p>
              </div>
            </div>

            <!-- Badge de priorité -->
            <div class="mb-3" v-if="selectedAnnonce.priorite === 'haute'">
              <span class="badge bg-danger">
                <i class="bx bx-star me-1"></i>Annonce importante
              </span>
            </div>

            <!-- Contenu de l'annonce -->
            <div class="mb-4">
              <div v-html="selectedAnnonce.contenu_annonce" class="content-display"></div>
            </div>

            <!-- Images -->
            <div class="mb-4" v-if="selectedAnnonce.images_annonce && selectedAnnonce.images_annonce.length > 0">
              <h6>Images</h6>
              <div class="row">
                <div 
                  v-for="(image, index) in selectedAnnonce.images_annonce" 
                  :key="index"
                  class="col-md-6 col-lg-4 mb-3"
                >
                  <img 
                    :src="image" 
                    class="img-fluid rounded shadow-sm cursor-pointer"
                    @click="showImageModal(image)"
                    :alt="`Image ${index + 1}`"
                    style="height: 150px; width: 100%; object-fit: cover;"
                  />
                </div>
              </div>
            </div>

            <!-- Documents à télécharger -->
            <div class="mb-4" v-if="selectedAnnonce.documents && selectedAnnonce.documents.length > 0">
              <h6>Documents joints</h6>
              <div class="list-group">
                <div 
                  v-for="doc in selectedAnnonce.documents" 
                  :key="doc.id"
                  class="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div class="d-flex align-items-center">
                    <i class="bx bx-file me-2 text-primary"></i>
                    <div>
                      <strong>{{ doc.nom }}</strong>
                      <br>
                      <small class="text-muted">{{ doc.type }} - {{ formatFileSize(doc.taille) }}</small>
                    </div>
                  </div>
                  <button 
                    class="btn btn-outline-primary btn-sm"
                    @click="downloadDocument(doc)"
                    :disabled="downloadingDocs[doc.id]"
                  >
                    <span v-if="downloadingDocs[doc.id]" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="bx bx-download me-1"></i>
                    Télécharger
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Fermer
            </button>
            <button 
              type="button" 
              class="btn btn-outline-primary"
              @click="shareAnnonce(selectedAnnonce)"
            >
              <i class="bx bx-share me-1"></i>
              Partager
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'image -->
    <div class="modal fade" id="imageModal" tabindex="-1" ref="imageModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Image</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center">
            <img :src="selectedImage" class="img-fluid" alt="Image agrandie" />
          </div>
        </div>
      </div>
    </div>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import PageTitle from "@/components/PageTitle.vue";
import SearchBox from "@/components/SearchBox.vue";
import { showSuccessMessage, showErrorMessage } from "@/helpers/notification";

// Types
interface Document {
  id: number;
  nom: string;
  type: string;
  taille: number;
  url: string;
}

interface Annonce {
  id: number;
  id_annonce: number;
  titre_annonce: string;
  contenu_annonce: string;
  date_annonce: string;
  visibilite: 'publiee';
  priorite?: 'normale' | 'haute';
  images_annonce?: string[];
  documents?: Document[];
  created_by?: {
    nom: string;
    prenom: string;
  };
  created_at?: string;
}

// État principal
const annonces = ref<Annonce[]>([]);
const searchQuery = ref("");
const selectedFilter = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(9);
const selectedAnnonce = ref<Annonce | null>(null);
const selectedImage = ref("");
const downloadingDocs = ref<Record<number, boolean>>({});

// Computed
const filteredAnnonces = computed(() => {
  let filtered = annonces.value;

  // Filtrage par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (annonce) =>
        annonce.titre_annonce.toLowerCase().includes(query) ||
        annonce.contenu_annonce.toLowerCase().includes(query)
    );
  }

  // Filtrage par type
  if (selectedFilter.value) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    filtered = filtered.filter((annonce) => {
      const annonceDate = new Date(annonce.date_annonce);
      
      switch (selectedFilter.value) {
        case 'recent':
          return annonceDate >= sevenDaysAgo;
        case 'thisMonth':
          return annonceDate >= startOfMonth;
        case 'important':
          return annonce.priorite === 'haute';
        default:
          return true;
      }
    });
  }

  // Tri par date (plus récent d'abord)
  return filtered.sort((a, b) => 
    new Date(b.date_annonce).getTime() - new Date(a.date_annonce).getTime()
  );
});

const totalPages = computed(() => Math.ceil(filteredAnnonces.value.length / itemsPerPage.value));

const paginatedAnnonces = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAnnonces.value.slice(start, end);
});

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, currentPage.value + 2);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

// Méthodes utilitaires
const truncateText = (html: string, length: number): string => {
  if (!html) return "";
  const plainText = stripHtmlTags(html);
  return plainText.length > length
    ? plainText.substring(0, length) + "..."
    : plainText;
};

const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const isNew = (annonce: Annonce): boolean => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  return new Date(annonce.date_annonce) > threeDaysAgo;
};

// Méthodes d'interaction
const viewFullAnnonce = (annonce: Annonce) => {
  selectedAnnonce.value = annonce;
  const modal = new (window as any).bootstrap.Modal(document.getElementById('annonceDetailModal'));
  modal.show();
};

const showImageModal = (imageUrl: string) => {
  selectedImage.value = imageUrl;
  const modal = new (window as any).bootstrap.Modal(document.getElementById('imageModal'));
  modal.show();
};

const downloadDocument = async (document: Document) => {
  try {
    downloadingDocs.value[document.id] = true;
    
    // Simulation du téléchargement
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Création d'un lien de téléchargement
    const link = document.createElement('a');
    link.href = document.url;
    link.download = document.nom;
    link.click();
    
    showSuccessMessage(`Document "${document.nom}" téléchargé avec succès`);
    
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    showErrorMessage('Erreur lors du téléchargement du document');
  } finally {
    downloadingDocs.value[document.id] = false;
  }
};

const shareAnnonce = async (annonce: Annonce) => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: annonce.titre_annonce,
        text: stripHtmlTags(annonce.contenu_annonce).substring(0, 100) + '...',
        url: window.location.href + '#annonce-' + annonce.id
      });
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
      await navigator.clipboard.writeText(
        `${annonce.titre_annonce}\n${window.location.href}#annonce-${annonce.id}`
      );
      showSuccessMessage('Lien copié dans le presse-papiers');
    }
  } catch (error) {
    console.error('Erreur lors du partage:', error);
  }
};

// Données de mock pour les parents
const mockAnnonces: Annonce[] = [
  {
    id: 1,
    id_annonce: 1001,
    titre_annonce: "Renforcement des heures de mathématiques",
    contenu_annonce: "<p>À partir du deuxième trimestre, les élèves de 4e et 3e auront une heure supplémentaire de mathématiques chaque semaine afin de mieux préparer les examens nationaux.</p><ul><li>Heures ajoutées : mercredi après-midi</li><li>Groupes de niveau mis en place</li><li>Séances d'exercices encadrées</li></ul>",
    date_annonce: "2024-12-15",
    visibilite: "publiee",
    priorite: "haute",
    images_annonce: [
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1453733190371-0a9bedd82893?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ],
    documents: [
      {
        id: 1,
        nom: "Programme_Maths_Renforcees.pdf",
        type: "PDF",
        taille: 245760,
        url: "https://example.com/docs/programme-maths.pdf"
      },
      {
        id: 2,
        nom: "Planning_Cours_Mercredi.xlsx",
        type: "Excel",
        taille: 51200,
        url: "https://example.com/docs/planning-mercredi.xlsx"
      }
    ],
    created_by: {
      nom: "ZINSOU",
      prenom: "Charlemagne"
    },
    created_at: "2024-12-10T10:00:00Z"
  },
  {
    id: 2,
    id_annonce: 1002,
    titre_annonce: "Cours de rattrapage pour les Terminales",
    contenu_annonce: "<p>Des cours de rattrapage seront organisés les samedis pour les classes de Terminale (A, C et D) en vue du Baccalauréat.</p><ul><li>Matières : Maths, Physique, Philo</li><li>Horaire : 08h à 12h</li><li>Présence obligatoire</li></ul>",
    date_annonce: "2024-12-20",
    visibilite: "publiee",
    priorite: "haute",
    images_annonce: [
      "https://plus.unsplash.com/premium_photo-1713890424186-11d3584a22fc?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ],
    documents: [
      {
        id: 3,
        nom: "Calendrier_Rattrapage_Terminales.pdf",
        type: "PDF",
        taille: 198435,
        url: "https://example.com/docs/calendrier-rattrapage.pdf"
      },
      {
        id: 4,
        nom: "Fiche_Inscription_Rattrapage.docx",
        type: "Word",
        taille: 76800,
        url: "https://example.com/docs/fiche-inscription.docx"
      }
    ],
    created_by: {
      nom: "AGOSSA",
      prenom: "Clarisse"
    },
    created_at: "2024-12-18T14:30:00Z"
  },
  {
    id: 3,
    id_annonce: 1003,
    titre_annonce: "Concours de dictée pour les 6e et 5e",
    contenu_annonce: "<p>Un concours de dictée est lancé pour les élèves de 6e et 5e. Les meilleurs recevront des récompenses en fin de trimestre.</p><ul><li>Inscription jusqu'au 31 janvier</li><li>Épreuve prévue le 10 février</li><li>Jury composé de professeurs de français</li></ul>",
    date_annonce: "2025-01-10",
    visibilite: "publiee",
    priorite: "normale",
    images_annonce: [
      "https://images.unsplash.com/photo-1610500796951-dea9be78d987?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ],
    documents: [
      {
        id: 5,
        nom: "Reglement_Concours_Dictee.pdf",
        type: "PDF",
        taille: 125440,
        url: "https://example.com/docs/reglement-concours.pdf"
      }
    ],
    created_by: {
      nom: "YAROU",
      prenom: "Firmin"
    },
    created_at: "2025-01-08T11:20:00Z"
  },
  {
    id: 4,
    id_annonce: 1004,
    titre_annonce: "Journée sportive interclasses",
    contenu_annonce: "<p>La journée sportive annuelle réunira toutes les classes de la 6e à la 1ère pour des compétitions : football, handball, athlétisme, relais, etc.</p><p>Chaque élève devra porter l'uniforme de sport de l'école. Les équipes seront constituées par niveau.</p>",
    date_annonce: "2025-01-25",
    visibilite: "publiee",
    priorite: "normale",
    images_annonce: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ],
    documents: [
      {
        id: 6,
        nom: "Programme_Journee_Sportive.pdf",
        type: "PDF",
        taille: 310275,
        url: "https://example.com/docs/programme-sport.pdf"
      },
      {
        id: 7,
        nom: "Autorisation_Parentale_Sport.pdf",
        type: "PDF",
        taille: 87552,
        url: "https://example.com/docs/autorisation-sport.pdf"
      }
    ],
    created_by: {
      nom: "TOGNISSÈ",
      prenom: "Adjovi"
    },
    created_at: "2025-01-20T16:45:00Z"
  },
  {
    id: 5,
    id_annonce: 1005,
    titre_annonce: "Réunion parents-professeurs",
    contenu_annonce: "<p>Une réunion parents-professeurs est organisée pour faire le point sur le premier trimestre et préparer le second.</p><p>Tous les parents sont invités à participer. Les rendez-vous individuels peuvent être pris auprès du secrétariat.</p>",
    date_annonce: "2025-02-05",
    visibilite: "publiee",
    priorite: "haute",
    images_annonce: [
      "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ],
    documents: [
      {
        id: 8,
        nom: "Invitation_Reunion_Parents.pdf",
        type: "PDF",
        taille: 156672,
        url: "https://example.com/docs/invitation-reunion.pdf"
      },
      {
        id: 9,
        nom: "Fiche_RDV_Individuel.pdf",
        type: "PDF",
        taille: 94208,
        url: "https://example.com/docs/fiche-rdv.pdf"
      }
    ],
    created_by: {
      nom: "DIRECTEUR",
      prenom: "Adjoint"
    },
    created_at: "2025-01-28T09:00:00Z"
  }
];

// Initialisation
onMounted(() => {
  // Charger les données de mock (uniquement les annonces publiées)
  annonces.value = mockAnnonces.filter(annonce => annonce.visibilite === 'publiee');
});
</script>

<style scoped>
.annonce-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.annonce-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
}

.cursor-pointer {
  cursor: pointer;
}

.content-display {
  line-height: 1.6;
}

.content-display p {
  margin-bottom: 1rem;
}

.content-display ul {
  padding-left: 1.5rem;
}

.content-display li {
  margin-bottom: 0.5rem;
}

.card-img-top-container {
  overflow: hidden;
}

.card-img-top {
  transition: transform 0.3s ease;
}

.card-img-top:hover {
  transform: scale(1.05);
}

.badge {
  font-size: 0.75rem;
}

.spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
  border-width: 0.125rem;
}

.page-link {
  border: 1px solid #dee2e6;
  color: #6c757d;
}

.page-link:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
  color: #495057;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
}

.list-group-item {
  border: 1px solid rgba(0, 0, 0, 0.125);
  padding: 0.75rem 1rem;
}

.list-group-item:first-child {
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}

.list-group-item:last-child {
  border-bottom-left-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

.modal-content {
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header {
  border-bottom: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
}

.alert {
  border: none;
  border-radius: 0.5rem;
}

.alert-info {
  background-color: #cff4fc;
  color: #055160;
}

.form-select {
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.375rem 2.25rem 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
}

.form-select:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.text-muted {
  color: #6c757d !important;
}

.display-4 {
  font-size: 2.5rem;
  font-weight: 300;
  line-height: 1.2;
}

@media (max-width: 768px) {
  .modal-dialog {
    margin: 1rem;
  }
  
  .card-img-top {
    height: 150px !important;
  }
  
  .btn-sm {
    font-size: 0.75rem;
    padding: 0.2rem 0.4rem;
  }
  
  .pagination {
    justify-content: center !important;
  }
  
  .alert {
    font-size: 0.875rem;
  }
}

@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.5rem;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .btn-group .btn {
    font-size: 0.75rem;
  }
  
  .display-4 {
    font-size: 2rem;
  }
}
</style>