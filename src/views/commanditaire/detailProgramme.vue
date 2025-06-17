<template>
  <VerticalLayout>
    <b-row>
      <b-col cols="12">
        <b-card no-body>
          <b-card-body>
            <b-row>
              <b-col xl="3">
                <div class="d-grid">
                  <!-- <b-button type="button" variant="primary" id="btn-new-event" @click="openAddMediaModal">
                    <i class="bx bx-plus fs-18 me-2"></i>
                    Ajouter une chaine DE Média
                  </b-button> -->
                  <div class="d-grid">
                    <div class="d-flex align-items-center justify-content-between gap-2 mb-4">
                      <input type="text" 
                            v-model="searchMediaQuery" 
                            class="form-control form-control-sm" 
                            style="max-width: 300px;" 
                            placeholder="Rechercher une chaîne...">
                      <div class="d-flex gap-2">
                        <b-button variant="primary" @click="openAddMediaModal">
                          <i class='bx bx-plus'></i>
                        </b-button>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="external-events">
                  <br />
                  <p class="text-muted">Drag and drop your event or click in the calendar</p>
                  <template v-for="(media, idx) in filteredMedias" :key="idx">
                    <div  :class="`external-event bg-soft-${media.type_chaine === 'RADIO' ? 'primary' : 'success'} text-${media.type_chaine === 'RADIO' ? 'primary' : 'success'}`"
                    :data-class="`bg-${media.type_chaine === 'RADIO' ? 'primary' : 'success'}`" :data-media-id="media.id">
                      <i class="bx bxs-circle me-2 vertical-middle"></i>
                      {{ media?.nom_chaine }}
                    </div>
                  </template>
                </div>
              
                 

               
                <b-accordion id="accordionPanelsStayOpenExample" free class="mt-3">
                      <b-accordion-item title="Spot" visible>
                        <div class="d-grid">
                          <div class="d-flex align-items-center justify-content-between gap-2 mb-4">
                            <input type="text" class="form-control form-control-sm" 
                                  style="max-width: 300px;" 
                                  placeholder="Rechercher..." 
                                  id="searchInput">
                            <div class="d-flex gap-2">
                    
                              <b-button variant="primary" @click="openAddModalSpot" >
                                <i class='bx  bx-plus'></i>
                              </b-button>
                                
                            </div>
                          </div>
                        </div>
                        <div >
                            <b-form-group class="mt-3">
                              <ul id="dataLists2" class="list-unstyled listes overflow-auto">
                                <li v-for="spot in filteredSpots" :key="spot.id" class="d-flex align-items-center justify-content-between gap-2 px-2 py-2 list-data position-relative">
                                    <div class="d-flex align-items-center gap-2">
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="spot"
                                                  :id="`spot_${spot.id}`" 
                                                  :value="spot.id" v-model="spotSelectionner" >
                                            <label class="form-check-label" for="check_${item.id}">
                                              {{  spot.titre }}
                                            </label>
                                        </div>
                                    </div>
                                    <div >
                                        <button
                                            v-if="canUpdateSpot"
                                            class="btn btn-sm btn-soft-primary me-1"
                                            @click="openEditModalSpot(spot)"
                                        >
                                            <i class="bx bx-pencil"></i>
                                        </button>
                                        <button
                                            v-if="canDeleteSpot"
                                            class="btn btn-sm btn-soft-danger"
                                            @click="openDeleteModalSpot(spot)"
                                        >
                                            <i class="bx bx-trash"></i>
                                        </button>
                                    </div>
                                </li>
                              </ul>

                          </b-form-group>
                        </div>
                      </b-accordion-item>
                      <b-accordion-item title="Agents de suivi">
                        <div class="d-grid">
                          <div class="d-flex align-items-center justify-content-between gap-2 mb-4">
                            <input type="text"
                                  v-model="searchQueryAgent"
                                  class="form-control form-control-sm"
                                  style="max-width: 300px;"
                                  placeholder="Rechercher un agent...">
                            <div class="d-flex gap-2">
                              <b-button variant="primary" @click="openAddModalAgent" v-if="canCreateAgent">
                                <i class='bx bx-plus'></i>
                              </b-button>
                            </div>
                          </div>
                        </div>
                        <div>
                            <b-form-group class="mt-3">
                              <ul id="dataList3" class="list-unstyled listes overflow-auto">
                                <li v-for="agent in filteredAgents"
                                    :key="agent.id"
                                    class="d-flex align-items-center justify-content-between gap-2 px-2 py-2 list-data position-relative">
                                  
                                  <div class="d-flex align-items-center gap-2">
                                    <div class="form-check">
                                      <input class="form-check-input"
                                            type="radio"
                                            name="agent"
                                            :id="`agent_${agent.id}`"
                                            :value="agent.id"
                                            v-model="agentSelectionner" 
                                      >
                                      <label class="form-check-label" :for="`agent_${agent.id}`">
                                        {{ agent.nom }} {{ agent.prenom }}
                                      </label>
                                    </div>
                                  </div>

                                  <div>
                                    <button
                                      v-if="canUpdateAgent"
                                      class="btn btn-sm btn-soft-primary me-1"
                                      @click="openEditModalAgent(agent)"
                                    >
                                      <i class="bx bx-pencil"></i>
                                    </button>
                                    <button
                                      v-if="canDeleteAgent"
                                      class="btn btn-sm btn-soft-danger"
                                      @click="openDeleteModalAgent(agent)"
                                    >
                                      <i class="bx bx-trash"></i>
                                    </button>
                                  </div>
                                </li>
                                <li v-if="!filteredAgents.length" class="text-center py-3">
                                  Aucun agent trouvé
                                </li>
                              </ul>
                          </b-form-group>
                        </div>
                      </b-accordion-item>
                  
                </b-accordion>
              </b-col>
             
              <b-col xl="9">
                <div class="mt-4 mt-lg-0">
                  <div id="calendar">
                    <FullCalendar ref="fullCalendar" :bootstrap-font-awesome="false" :options="calendarOptions" />
                  </div>
                </div>
              </b-col>
            </b-row>
          
          </b-card-body>
        </b-card>

        <b-modal v-model="modal" :title="isEditEvent ? 'Modifier le programme' : 'Ajouter un programme'" header-class="p-3 border-bottom-0"
          body-class="px-3 pb-3 pt-0" hide-footer>
          <div v-if ="info">
          <div class="container my-4">
                <div class="card shadow">
                  <div class="card-body">
                    <h5 class="card-title">🎯 Spot : <strong>{{ infoSpot.nomSpot }}</strong></h5>
                    <p class="mb-1">👤 Agent : <strong>{{ infoSpot.nomAgent }}</strong></p>
                    <p class="mb-3">📺 Chaîne : <strong>{{infoSpot.nomChaine }}</strong></p>
                    <p class="mb-3">🕒 Tranches audio : <strong>{{infoSpot.tranche_journee}}</strong></p>
                    <p class="mb-3">🕒 Statut : 
                      <b-badge v-if="infoSpot.statutProgramme ='attente'" :variant="null" pill class="badge-outline-primary me-1">En attente</b-badge>
                      <b-badge v-else-if="infoSpot.statutProgramme ='en_retard'" :variant="null" pill class="badge-outline-danger me-1">En retard</b-badge>
                      <b-badge  v-else-if="infoSpot.statutProgramme ='non_diffuse'"  :variant="null" pill class="badge-outline-secondary me-1">Non diffusé</b-badge>
                      <b-badge v-else-if="infoSpot.statutProgramme ='diffuse'" :variant="null" pill class="badge-outline-success me-1">Diffusé</b-badge>
                    </p>

                    <h6 class="mt-4">🎧 Audios associés</h6>
                    <b-spinner v-if="audioLoader" variant="primary" />
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0">Fichiers Audio</h5>
                        <button class="btn btn-outline-secondary btn-sm" @click="actualiserAudio">
                          <i class='bx bx-refresh me-1'></i>
                          Actualiser
                        </button>
                      </div>

                      <ul v-if="infoSpot.audios" class="list-group mb-3">
                        <li 
                            v-for="audio in infoSpot.audios" 
                            :key="audio.id"
                            class="list-group-item">
                          
                          <!-- Header avec nom et bouton -->
                          <div class="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                            <div class="flex-grow-1 min-w-0">
                              <h6 class="mb-1 text-truncate fw-bold" :title="audio.nom_original">
                                {{ audio.nom_original }}
                              </h6>
                              <small class="text-muted">{{ audio.taille_formatee }}</small>
                            </div>
                            
                            <button 
                                class="btn btn-info btn-sm flex-shrink-0" 
                                @click="telechargerAudio(audio)">
                              <i class='bx bx-download me-1'></i>
                              <span class="d-none d-sm-inline">Télécharger</span>
                            </button>
                            <button 
                              class="btn btn-primary btn-sm flex-shrink-0"
                              @click="streamAudio(audio)">
                              <i class='bx bx-play-circle me-1'></i>
                              <span class="d-none d-sm-inline">Lire</span>
                            </button>
                            
                          </div>

                          <!-- Lecteur audio -->
                          <audio id="audioPlayer" controls class="w-100">
                            <source :src="audioUrls" type="audio/mpeg">
                            Votre navigateur ne supporte pas la balise audio.
                          </audio>
                        </li>
                      </ul>

                    <p v-else>Aucun audio associé</p>
                  </div>
                </div>
              </div>
              <b-col cols="6 mx-auto" class="text-center">
                <b-button :disabled="audioLoader " type="button" variant="info" id="btn-delete-event" @click="toggleInfo() " v-if="isEditEvent">
                  <span
                    v-if="audioLoader "
                    class="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span>Modifier le programme</span>
                </b-button>
              </b-col>
         </div>
          <b-form v-else @submit.prevent="handleVuelidateSubmitProgramme">
            <b-row>
              <b-col cols="12">
                <div class="mb-3">
                  <b-form-group label="Date de début">
                    <b-form-input  type="datetime-local" v-model="v.date_debut.$model" />
                    <div v-if="v.date_debut.$error" class="text-danger">Veuillez entrez la date de début</div>
                  </b-form-group>
                </div>
              </b-col>
              <b-col cols="12">
                <div class="mb-3">
                  <b-form-group label="Date de fin">
                    <b-form-input  type="datetime-local" v-model="v.date_fin.$model" />
                    <div v-if="v.date_fin.$error" class="text-danger">Veuillez entrez la date de fin</div>
                  </b-form-group>
                </div>
              </b-col>
              <b-col cols="12">
                <div class="mb-3">
                  <b-form-group label="Agents">
                    <b-form-select v-model="v.agent_id.$model">
                      <option :value="option.id" v-for="(option, idx) in agents" :key="idx">
                        {{ option.nom }}{{ option.prenom }}
                      </option>
                    </b-form-select>
                    <div v-if="v.agent_id.$error" class="text-danger">Veuillez choisir un agent</div>
                  </b-form-group>
                </div>
              </b-col>
              <b-col cols="12">
                <div class="mb-3">
                  <b-form-group label="Spot pubicitaire">
                    <b-form-select v-model="v.spot_publicitaire_id.$model">
                      <option :value="option.id" v-for="(option, idx) in spots" :key="idx">
                        {{ option.titre }} 
                      </option>
                    </b-form-select>
                    <div v-if="v.spot_publicitaire_id.$error" class="text-danger">Veuillez choisir un spot pblicitare</div>
                  </b-form-group>
                </div>
              </b-col>
              <b-col cols="12">
                <div class="mb-3">
                  <b-form-group label="Média de diffusion">
                    <b-form-select v-model="v.chaine_id.$model">
                      <option :value="option.id" v-for="(option, idx) in medias" :key="idx">
                        {{ option.nom_chaine }}  {{ option.type_chaine }} 
                      </option>
                    </b-form-select>
                    <div v-if="v.chaine_id.$error" class="text-danger">Veuillez choisir un Méia de diffusion</div>
                  </b-form-group>
                </div>
              </b-col>
            </b-row>
            <b-row>
              <b-col cols="6">
                <b-button class="me-1" :disabled="loadingProgramme2" type="button" variant="danger" id="btn-delete-event" @click="deleteEvent" v-if="isEditEvent">
                  <span
                    v-if="loadingProgramme2"
                    class="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span>Supprimer</span>
                </b-button>
                <b-button type="button" variant="light"  @click="toggleModal"> Annuler</b-button>
                
              </b-col>
              <b-col cols="6" class="text-end"> 
              <b-button v-if="!loadingProgramme && isEditEvent"
                :disabled="audioLoader" 
                class="me-2" 
                type="button" 
                variant="info" 
                id="btn-delete-event" 
                @click="toggleInfo()" 
                
              > 
                <span 
                  v-if="audioLoader" 
                  class="spinner-border spinner-border-sm me-2" 
                  role="status" 
                  aria-hidden="true"
                ></span> 
                <span>Information</span> 
              </b-button> 
              
              <button v-if="!audioLoader"
                type="submit" 
                id="btn-save-event" 
                class="btn btn-primary d-inline-flex align-items-center" 
                :disabled="loadingProgramme"
              > 
                <span 
                  v-if="loadingProgramme" 
                  class="spinner-border spinner-border-sm me-2" 
                  role="status" 
                  aria-hidden="true"
                ></span> 
                <span>{{ isEditEvent ? 'Modifier' : 'Ajouter' }}</span> 
              </button> 
            </b-col>
            </b-row>
          </b-form>
        </b-modal>

        <!-- Media Modals -->
        <b-modal
          v-model="showMediaModal"
          :title="isEditingMedia ? 'Modifier le média' : 'Ajouter un média'"
          @hidden="resetMediaForm"
          @cancel="handleMediaCancel"
          :hide-footer="true"
        >
       
          <form ref="mediaForm" @submit.prevent="handleMediaSubmit">
            <div class="mb-3">
              <label for="nom_chaine" class="form-label">Nom de la chaîne</label>
              <input
                type="text"
                class="form-control"
                :class="{ 'is-invalid': v$.nom_chaine.$error }"
                id="nom_chaine"
                v-model="mediaFormData.nom_chaine"
              />
              <div class="invalid-feedback" v-if="v$.nom_chaine.$error">
                Le nom de la chaîne est requis
              </div>
            </div>

            <div class="mb-3">
              <label for="type_chaine" class="form-label">Type de chaîne</label>
              <select
                class="form-select"
                :class="{ 'is-invalid': v$.type_chaine.$error }"
                id="type_chaine"
                v-model="mediaFormData.type_chaine"
              >
                <option value="RADIO">Radio</option>
                <option value="TV">TV</option>
              </select>
              <div class="invalid-feedback" v-if="v$.type_chaine.$error">
                Le type de chaîne est requis
              </div>
            </div>

            <div class="mb-3">
              <label for="url_stream" class="form-label">URL du stream</label>
              <input
                type="url"
                class="form-control"
                :class="{ 'is-invalid': v$.url_stream.$error }"
                id="url_stream"
                v-model="mediaFormData.url_stream"
              />
              <div class="invalid-feedback" v-if="v$.url_stream.$error">
                L'URL du stream est requise
              </div>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="handleMediaCancel"
                :disabled="loadingMedia"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="loadingMedia || v$.$invalid"
              >
                <span
                  v-if="loadingMedia"
                  class="spinner-border spinner-border-sm me-1"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span>{{ isEditingMedia ? 'Modifier' : 'Ajouter' }}</span>
              </button>
            </div>
          </form>
        </b-modal>

        <!-- Media Delete Modal -->
        <b-modal
          v-model="showDeleteMediaModal"
          title="Confirmer la suppression"
          @hidden="selectedMedia = null"
          @cancel="handleMediaCancel"
          :hide-footer="true"
        >
          <p>Êtes-vous sûr de vouloir supprimer ce média ?</p>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="handleMediaCancel"
              :disabled="loadingMedia"
            >
              Annuler
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="handleMediaDelete"
              :disabled="loadingMedia"
            >
              <span
                v-if="loadingMedia"
                class="spinner-border spinner-border-sm me-1"
                role="status"
                aria-hidden="true"
              ></span>
              <span>{{ loadingMedia ? 'En cours...' : 'Supprimer' }}</span>
            </button>
          </div>
        </b-modal>


         <!-- Modal d'ajout/modification spots -->
        <b-modal
          v-model="showModalSpot"
          :title="isEditingSpot ? 'Modifier le spot' : 'Ajouter un spot'"
          @hidden="resetFormSpot"
          :ok-disabled="loadingSpot"
          :ok-title="buttonTextSpot"
          :cancel-title="'Annuler'"
          @ok="handleSubmitSpot"
          @cancel="handleCancelSpot"
          :hide-footer="false"
        >
       
          <form  ref="spotForm" @submit.prevent="handleSubmitSpot" novalidate>
            <div class="mb-3">
              <FormField
                v-model="formSpot.titre"
                label="Titre"
                type="text"
                required
                id="titre"
                :error="formErrorsSpot?.titre?.[0]"
              />
            </div>
            <div class="mb-3">
              <FormField
                v-model="formSpot.contenu"
                label="Contenu"
                type="text"
                required
                id="contenuSpot"
                :error="formErrorsSpot?.titre?.[0]"
              />
            </div>
            <div class="mb-3">
              <FormField
                v-model="formSpot.type"
                label="Type"
                type="select"
                :options="[{ value: 'SPOT', label: 'Spot' }, { value: 'EMISSION', label: 'Émission' }]"
                required
                id="type"
                :error="formErrorsSpot?.type?.[0]"
              />
            </div>
            <div class="mb-3">
              <FormField
                
                label="Fichier de référence"
                required
                id="fichier_reference"
                type="file" accept="audio/*"
                v-model="formSpot.audios"
                multiple
                @change="handleAudioUpload"
              />
            </div>      
          </form>
        </b-modal>

        <!-- Modal de confirmation de suppression spotq-->
        <b-modal
          v-model="showDeleteModalSpot"
          title="Confirmer la suppression"
          @hidden="selectedSpot = null"
          :ok-disabled="loadingSpot"
          ok-title="Supprimer"
          :cancel-title="'Annuler'"
          @ok="handleDeleteSpot"
          @cancel="handleCancelSpot"
        >
          <p>Êtes-vous sûr de vouloir supprimer ce spot ?</p>
        </b-modal>


      <!-- Modal d'ajout/modification agent -->
      <b-modal
        v-model="showModalAgent"
        :title="isEditingAgent ? 'Modifier l\'agent' : 'Ajouter un agent'"
        @hidden="resetFormAgent"
        :ok-disabled="loadingAgent"
        :ok-title="buttonTextAgent"
        :cancel-title="'Annuler'"
        @ok="handleSubmitAgent"
        @cancel="handleCancelAgent"
        :hide-footer="false"
      >
        <form ref="agentForm" @submit.prevent="handleSubmitAgent" novalidate>
          <div class="mb-3">
            <FormField
              v-model="formAgent.nom"
              label="Nom"
              type="text"
              required
              id="nom"
              :error="formErrorsAgent?.nom?.[0]"
            />
          </div>
          <div class="mb-3">
            <FormField
              v-model="formAgent.prenom"
              label="Prénom"
              type="text"
              required
              id="prenom"
              :error="formErrorsAgent?.prenom?.[0]"
            />
          </div>
          <div class="mb-3">
            <FormField
              v-model="formAgent.email"
              label="Email"
              type="email"
              required
              id="email"
              :error="formErrorsAgent?.email?.[0]"
            />
          </div>
          <div class="mb-3">
            <FormField
              v-model="formAgent.adresse"
              label="Adresse"
              type="text"
              required
              id="adresseAgent"
              :error="formErrorsAgent?.adresse?.[0]"
            />
          </div>
          <div class="mb-3">
            <FormField
              v-model="formAgent.password"
              label="Mot de passe"
              type="text"
              required
              id="passwordAgent"
              :error="formErrorsAgent?.password?.[0]"
            />
          </div>
          <div class="mb-3">
            <FormField
              v-model="formAgent.telephone"
              label="Téléphone"
              type="tel"
              required
              id="telephone"
              :error="formErrorsAgent?.telephone?.[0]"
            />
          </div>
        </form>
      </b-modal>

      <!-- Modal de confirmation de suppression agent -->
      <b-modal
        v-model="showDeleteModalAgent"
        title="Confirmer la suppression"
        @hidden="selectedAgent = null"
        :ok-disabled="loadingAgent"
        :ok-title="loadingAgent ? loadingTextAgent : 'Supprimer'"
        :cancel-title="'Annuler'"
        @ok="handleDeleteAgent"
        @cancel="handleCancelAgent"
      >
        <p>Êtes-vous sûr de vouloir supprimer cet agent ?</p>
      </b-modal>


      <!-- Modal intervalle de temps -->
      <b-modal
        v-model="timeModal"
        title="Choisir un intervalle de temps"
        @hidden="resetFormIntervalle"
        @cancel="handleCancelIntervalle"
        :hide-footer="true"
      >
        <form ref="intervalleTime" @submit.prevent="handleSubmitProgramme" novalidate>
          <div class="mb-3">
            <label for="titre" class="form-label">Heure de début</label>
            <input
            type="datetime-local"
              class="form-control"
              id="dateHeureDebut"
              v-model="form.start"
            />
          
          </div>
          <div class="mb-3">
            <label for="titre" class="form-label">Heure de fin</label>
            <input
            type="datetime-local"
              class="form-control"
              id="dateHeureFin"
              v-model="form.end"
            />
          </div>

          

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="handleCancelIntervalle"
              :disabled="loadingProgramme"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              
            >
              <span
                v-if="loadingProgramme"
                class="spinner-border spinner-border-sm me-1"
                role="status"
                aria-hidden="true"
              ></span>
              <span>Ajouter</span>
            </button>
          </div>
        </form>
      </b-modal>


      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
// @ts-nocheck
import dayjs from 'dayjs'
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import { ref, onMounted, reactive, computed } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import listPlugin from '@fullcalendar/list';
import { type CalendarOptions } from '@fullcalendar/core';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { options ,initialEvents , externalEvents } from '@/views/apps/calendar/schedule/components/data';
import { Icon } from "@iconify/vue";
import { mediaService } from '@/services/media';
import { audioService } from '@/services/audio';
import { programmeService } from '@/services/programme';
import { showSuccessMessage, showErrorMessage } from '@/helpers/notification';
import { usePermissionStore } from '@/stores/permissionStore';
import FormField from '@/components/FormField.vue';
import { spotService } from '@/services/spot';
import { agentService } from '@/services/agent';
import { useRoute } from 'vue-router';
import  { BASE_URL } from '../../helpers/http-client'; 
import { useLocalStorage  } from "@vueuse/core";
const user = useLocalStorage<string | null>("L3-AL_USER", null);

interface Media {
  id: number;
  nom_chaine: string;
  type_chaine: string;
  logo?: string;
}

interface Spot {
  id: number;
  titre: string;
  contenu: string;
  type: string;
  commanditaire_id: string;
  audios?: File[];
  audio?: File;
}

interface Agent {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  password: string;
}

interface InfoSpot {
  nomSpot: string;
  spotId: string;
  audios: any[];
  nomAgent: string;
  nomChaine: string;
  tranche_journee: string;
  dateDebut: string;
  datefin: string;
  statutProgramme: string;
}

interface FormErrors {
  [key: string]: string[];
}

interface Programme {
  id?: number;
  titre: string;
  description?: string;
  date_debut: string;
  date_fin: string;
  statut: string;
  commanditaire_id: string;
  spots?: Spot[];
  agents?: Agent[];
  medias?: Media[];
}

const route = useRoute();
const commanditaireId = computed(() => route.params.id as string);



//Crud de spots 

const permissionsSpot = {
  create: ['spot:create'],
  update: ['spot:update'],
  delete: ['spot:delete'],
  export: ['spot:export']
};

const permissionsAgent = {
  create: ['agent:create'],
  update: ['agent:update'],
  delete: ['agent:delete'],
  export: ['agent:export']
};

const spotForm = ref(null)

// Utilisation du store de permissions
//const permissionStore = usePermissionStore();

// Vérification des permissions
const canCreateSpot = computed(() => permissionStore.checkPermissions(permissionsSpot.create));
const canUpdateSpot = computed(() => permissionStore.checkPermissions(permissionsSpot.update));
const canDeleteSpot = computed(() => permissionStore.checkPermissions(permissionsSpot.delete));
const canExportSpot = computed(() => permissionStore.checkPermissions(permissionsSpot.export));

const canCreateAgent = computed(() => permissionStore.checkPermissions(permissionsAgent.create));
const canUpdateAgent = computed(() => permissionStore.checkPermissions(permissionsAgent.update));
const canDeleteAgent = computed(() => permissionStore.checkPermissions(permissionsAgent.delete));
const canExportAgent = computed(() => permissionStore.checkPermissions(permissionsAgent.export));

// État
const spots = ref<Spot[]>([]);
const agents = ref<Agent[]>([]);
const medias = ref<Media[]>([]);
const searchQueryAgent = ref('');
const showModalAgent = ref(false);
const showDeleteModalAgent = ref(false);
const loadingAgent = ref(false);
const isEditingAgent = ref(false);
const selectedAgent = ref<Agent | null>(null);
const formErrorsAgent = ref({});

const infoSpot = ref<InfoSpot>({
  nomSpot: '',
  spotId: '',
  audios: [],
  nomAgent: '',
  nomChaine: '',
  tranche_journee: '',
  dateDebut: '',
  datefin: '',
  statutProgramme: ''
});

const info = ref(false)
const audioLoader = ref(false)

const toggleInfo = () => {
  info.value = !info.value;
};

const getSpotAudio = async (spotId: string) => {
   
  audioLoader.value = true;
  try {
    const data = await spotService.getAudioSpot(spotId);
   
    infoSpot.value.audios = data;
  }catch (error) {
    
    showErrorMessage('Erreur lors de la récupération des audios du spot');
  }finally {
    audioLoader.value = false;
  }
  
}

const telechargerAudio = async (audio) => {
  const url = `${BASE_URL}/audios/${audio.id}/download`;

  const token = JSON.parse(user.value).token; // Remplace ce token dynamiquement si besoin

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (!response.ok) {
      throw new Error('Erreur réseau : ' + response.status);
    }

    // Extraire le nom du fichier depuis Content-Disposition
    const disposition = response.headers.get('Content-Disposition');
    let filename = 'audio.mp3';

    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    showErrorMessage("Échec du téléchargement : " + error.message);
  }
};

const actualiserAudio = async () => {
  getSpotAudio(infoSpot.value.spotId)
}

const formAgent = ref<Agent>({
  id: 0,
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  adresse: '',
  password: ''
});

const loadingTextAgent = ref(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> En cours...`);
const searchQuerySpot = ref('');
const currentPageSpot = ref(1);
const itemsPerPageSpot = ref(10);
const showModalSpot = ref(false);
const showDeleteModalSpot = ref(false);
const loadingSpot = ref(false);
const isEditingSpot = ref(false);
const selectedSpot = ref<Spot | null>(null);


const loadingTextSpot = ref("En cours...");

// Formulaires avec types
const formSpot = ref<Spot>({
  id: 0,
  titre: '',
  contenu: '',
  type: 'SPOT',
  commanditaire_id: commanditaireId.value,
  audios: []
});



// Computed properties
const filteredAgents = computed(() => {
  const query = searchQueryAgent.value.toLowerCase();
  return agents.value.filter(agent =>
    agent.nom.toLowerCase().includes(query) ||
    agent.prenom.toLowerCase().includes(query) ||
    agent.email.toLowerCase().includes(query) ||
    agent.telephone?.toLowerCase().includes(query)
  );
});

const filteredSpots = computed(() => {
  return spots.value.filter(spot =>
    spot.titre.toLowerCase().includes(searchQuerySpot.value.toLowerCase()) ||
    spot.type.toLowerCase().includes(searchQuerySpot.value.toLowerCase()) 
    
  );
});

const spotSelectionner = ref("")
const agentSelectionner = ref("")

// const totalItemsSpot = computed(() => filteredSpots.value.length);
// const startIndexSpot = computed(() => (currentPage.value - 1) * itemsPerPage.value);
// const endIndexSpot = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value));

// Méthodes
const openAddModalSpot = () => {
  isEditingSpot.value = false;
  showModalSpot.value = true;
};

const openEditModalSpot = (spot) => {
  isEditingSpot.value = true;
  selectedSpot.value = spot;
 // formSpot.value = { ...spot };

  formSpot.value = {
    titre: spot.titre,
    contenu: spot.contenu,
    type: spot.type,
    audio: spot.audio,
    commanditaire_id : commanditaireId.value,
  };
  showModalSpot.value = true;
};

const openDeleteModalSpot = (spot) => {
  selectedSpot.value = spot;
  showDeleteModalSpot.value = true;
};

const formErrorsSpot = ref<FormErrors>({});

const resetFormSpot = () => {
  formSpot.value = {
    titre: '',
    contenu: '',
    type: 'SPOT',
    audio: '',
  };
  formErrorsSpot.value = {};
  selectedSpot.value = null;
};

const validateSpotForm = (form) => {
  const errors = [];

  if (!form.titre || !form.titre.trim()) {
    errors.push("Le titre est requis.");
  }

  if (!form.contenu || !form.contenu.trim()) {
    errors.push("Le contenu est requis.");
  }

  if (!form.type || !form.type.trim()) {
    errors.push("Le type est requis.");
  }

  // Vérification robuste de commanditaire_id (même si c'est 0)
  if (form.commanditaire_id === null || form.commanditaire_id === undefined || form.commanditaire_id === '') {
    errors.push("Le commanditaire est requis.");
  }

  // Vérification robuste des fichiers audio
  if (!Array.isArray(form.audios) || form.audios.length === 0 || !form.audios.some(audio => Object.keys(audio).length > 0)) {
    errors.push("Au moins un fichier audio valide est requis.");
  }

  return errors;
};

const audioUrls = ref("")

const streamAudio = async (audio) => {


  const url = `${BASE_URL}/audios/${audio.id}/download`;

  const token = JSON.parse(user.value).token; // Remplace ce token dynamiquement si besoin
  fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur réseau : ' + response.status);
        }
        return response.blob();
      })
      .then(blob => {
        const audioUrl = URL.createObjectURL(blob);
        const player = document.getElementById('audioPlayer2');
        player.src = audioUrl;
        player.play();
        audioUrls.value = audioUrl
      })
      .catch(error => {
        alert('Erreur lors du streaming : ' + error.message);
      });
}

let formDataSpot = null; 
const audios = ref([]);

const handleAudioUpload = (event) => {
  const file = event.target.files[0];
  // audios.value = Array.from(files);  // récupère le fichier
  if (!file) return;
  formDataSpot = new FormData();

   // audios.value.forEach((file, index) => {
      formDataSpot.append(`audio`, file);
  //  });

   

};


const handleSubmitSpot = async (event) => {
  event.preventDefault();
  if (!spotForm.value?.checkValidity()) {
    spotForm.value?.reportValidity();
    return;
  }
    loadingSpot.value = true;
    formErrorsSpot.value = {};

  try {
    formDataSpot.append('titre', formSpot.value.titre);
    formDataSpot.append('contenu', formSpot.value.contenu);
    formDataSpot.append('type', formSpot.value.type);
    formDataSpot.append('commanditaire_id', formSpot.value.commanditaire_id);
     

    if (isEditingSpot.value) {
      await spotService.update(selectedSpot.value.id, formDataSpot);
      showSuccessMessage('Spot modifié avec succès');
      formDataSpot = new FormData(); 
      resetFormSpot()
    } else {
      await spotService.create(formDataSpot);
      showSuccessMessage('Spot ajouté avec succès');
      formDataSpot = new FormData(); 
      resetFormSpot()
    }
    showModalSpot.value = false;
    loadSpots();
  } catch (error) {
    console.log(error);
    formDataSpot = new FormData();  
    if (error?.response?.data?.errors) {
      formErrorsSpot.value = error.response.data.errors;
    } else {
      showErrorMessage('Erreur lors de l\'enregistrement');
    }
  } finally {
    loadingSpot.value = false;
  }
};

const handleDeleteSpot = async () => {
  loadingSpot.value = true;
  try {
    await spotService.delete(selectedSpot.value.id);
    spots.value = spots.value.filter(c => c.id !== selectedSpot.value?.id);
    showSuccessMessage('Spot supprimé avec succès');
    showDeleteModalSpot.value = false;
  } catch (error) {
    showErrorMessage('Erreur lors de la suppression');
  } finally {
    loadingSpot.value = false;
  }
};

const handleCancelSpot = () => {
  showModalSpot.value = false;
  showDeleteModalSpot.value = false;
  resetFormSpot();
  selectedSpot.value = null;
  isEditingSpot.value = false;
};

const loadSpots = async () => {
  loadingSpot.value = true;
  try {
    spots.value = await spotService.getCommanditaireSpot(route.params.id);
  } catch (error) {
    showErrorMessage('Erreur lors du chargement des spots');
  } finally {
    loadingSpot.value = false;
  }
};

 

// Fonctions pour la gestion des agents
const loadAgents = async () => {
  try {
    loadingAgent.value = true;
    const data = await agentService.getAll();
    agents.value = data.agents;
  } catch (error) {
    showErrorMessage('Erreur lors du chargement des agents');
  } finally {
    loadingAgent.value = false;
  }
};

const programmes = ref([]);

const loadProgramme = async () => {
  try {
    loadingProgramme.value = true;
    const data = await programmeService.getCampagneCategorie(route.params.campagnesId);

    programmes.value = data;

    
    programmes.value = programmes.value.map(programme => ({
      id: programme.id.toString(),
      title: `${programme.spot_publicitaire.titre}` + " " + `(${programme.chaine.nom_chaine})`,
      start: `${programme.date_debut.replace(' ', 'T')}`,
      end: `${programme.date_fin.replace(' ', 'T')}`,  // fixe ou calculé dynamiquement
      className: programme.statut =='en_retard' ? 'bg-danger' : 'bg-success',      // selon un critère
      extendedProps: {
        agent_id: programme.agent_id ,
        spot_id: programme.spot_publicitaire_id,
        chaine_id: programme.chaine_id,
        nomSpot: programme.spot_publicitaire.titre,
        nomChaine: programme.chaine.nom_chaine,
        nomAgent: programme?.agent?.nom + " " + programme?.agent?.prenom || '',
        tranche_journee: programme.tranche_journee,
        statutProgramme : programme.statut,
      }
    }));

    calendarOptions.value.events = [...programmes.value];


  } catch (error) {
   
    showErrorMessage('Erreur lors du chargement des programmes');
  } finally {
    loadingProgramme.value = false;
  }
};

const loadMedia = async () => {
  loadingMedia.value = true;
  try {
    medias.value = await mediaService.getAll();
  
  } catch (error) {
    showErrorMessage('Erreur lors du chargement des médias');
  } finally {
    loadingMedia.value = false;
  }
}

const openAddModalAgent = () => {
  isEditingAgent.value = false;
  formAgent.value = {
    nom: '',
    prenom: '',
    email: '',
    telephone: ''
  };
  showModalAgent.value = true;
};

const openEditModalAgent = (agent) => {
  isEditingAgent.value = true;
  selectedAgent.value = agent;
  formAgent.value = { ...agent };
  showModalAgent.value = true;
};

const openDeleteModalAgent = (agent) => {
  
  selectedAgent.value = agent.id;
  showDeleteModalAgent.value = true;
};

const resetFormAgent = () => {
  formAgent.value = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    adresse: '',
  };
  formErrorsAgent.value = {};
  selectedAgent.value = null;


};


const agentForm = ref(null)
const handleSubmitAgent = async (event) => {
  event.preventDefault();
  if (!agentForm.value?.checkValidity()) {
    agentForm.value?.reportValidity();
    return;
  }
  loadingAgent.value = true;
  formErrorsAgent.value = {};

  try {
    if (isEditingAgent.value) {
      delete formAgent.value.email;
      await agentService.update(selectedAgent.value.id, formAgent.value);
      showSuccessMessage('Agent modifié avec succès');
    } else {
      await agentService.create(formAgent.value);
      showSuccessMessage('Agent ajouté avec succès');
    }
    showModalAgent.value = false;
    loadAgents();
  } catch (error) {
    
    if (error?.errors) {
      formErrorsAgent.value = error.errors;
    } else {
      showErrorMessage('Erreur lors de l\'enregistrement');
    }
  } finally {
    loadingAgent.value = false;
  }
};



const handleDeleteAgent = async () => {
  try {
    loadingAgent.value = true;
    await agentService.delete(selectedAgent.value);
    showSuccessMessage('Agent supprimé avec succès');
    showDeleteModalAgent.value = false;
    loadAgents();
  } catch (error) {
    showErrorMessage('Erreur lors de la suppression');
  } finally {
    loadingAgent.value = false;
  }
};

const handleCancelAgent = () => {
  showModalAgent.value = false;
  showDeleteModalAgent.value = false;
  resetFormAgent();
  selectedAgent.value = null;
  isEditingAgent.value = false;
};

const buttonTextAgent = computed(() => {
  if (loadingAgent.value) return loadingTextAgent.value;
  return isEditingAgent.value ? 'Modifier' : 'Ajouter';
});

 

const buttonTextSpot = computed(() => {
  if (loadingSpot.value) return loadingTextSpot.value;
  return isEditingSpot.value ? 'Modifier' : 'Ajouter';
});


// fin crud spots

//import { externalEvents, options, initialEvents } from '@/views/apps/calendar/schedule/components/data';

// Media Management

const searchMediaQuery = ref('');
const selectedMediaId = ref(null);
const showMediaModal = ref(false);
const showDeleteMediaModal = ref(false);
const selectedMedia = ref(null);
const loadingMedia = ref(false);
const isEditingMedia = ref(false);

const mediaForm = ref(null);
const mediaFormData = ref({
  nom_chaine: '',
  type_chaine: '',
  url_stream: ''
});

const mediaFormRules = {
  nom_chaine: { required },
  type_chaine: { required },
  url_stream: { required }
};

const v$ = useVuelidate(mediaFormRules, mediaFormData, { $autoDirty: true });

// Media Permissions
const mediaPermissions = {
  create: ['media:create'],
  update: ['media:update'],
  delete: ['media:delete']
};

const permissionStore = usePermissionStore();

const canCreateMedia = computed(() => permissionStore.checkPermissions(mediaPermissions.create));
const canUpdateMedia = computed(() => permissionStore.checkPermissions(mediaPermissions.update));
const canDeleteMedia = computed(() => permissionStore.checkPermissions(mediaPermissions.delete));

// Media Computed Properties
const filteredMedias = computed(() => {
  const query = searchMediaQuery.value.toLowerCase();
  return medias.value.filter(media =>
    media.nom_chaine.toLowerCase().includes(query) ||
    media.type_chaine.toLowerCase().includes(query)
  );
});

// Media methods
const openAddMediaModal = () => {
  isEditingMedia.value = false;
  showMediaModal.value = true;
};

const openEditMediaModal = (media) => {
  isEditingMedia.value = true;
  selectedMedia.value = media;
  mediaFormData.value = { ...media };
  showMediaModal.value = true;
};

const openDeleteMediaModal = (media) => {
  selectedMedia.value = media;
  showDeleteMediaModal.value = true;
};

const resetMediaForm = () => {
  v$.value.$reset();
  mediaFormData.value = {
    nom_chaine: '',
    type_chaine: '',
    url_stream: ''
  };
  selectedMedia.value = null;
};

const handleMediaSubmit = async (event) => {
  event.preventDefault();
  const isFormValid = await v$.value.$validate();
  if (!isFormValid) return;
  
  loadingMedia.value = true;
  try {
    if (isEditingMedia.value && selectedMedia.value) {
      const updatedMedia = await mediaService.update(selectedMedia.value.id, mediaFormData.value);
      const index = medias.value.findIndex(m => m.id === selectedMedia.value.id);
      if (index !== -1) {
        medias.value[index] = updatedMedia;
        showSuccessMessage('Média modifié avec succès');
      }
    } else {
      const newMedia = await mediaService.create(mediaFormData.value);
      // medias.value.unshift(newMedia);
      await mediaService.getAll();
      showSuccessMessage('Média créé avec succès');
    }
    showMediaModal.value = false;
    resetMediaForm();
  } catch (error) {
    showErrorMessage(error?.response?.data?.message || 'Erreur lors de la soumission');
  } finally {
    loadingMedia.value = false;
  }
};

const handleMediaDelete = async () => {
  loadingMedia.value = true;
  try {
    await mediaService.delete(selectedMedia.value.id);
    medias.value = medias.value.filter(m => m.id !== selectedMedia.value.id);
    showSuccessMessage('Média supprimé avec succès');
    showDeleteMediaModal.value = false;
  } catch (error) {
    showErrorMessage('Erreur lors de la suppression');
  } finally {
    loadingMedia.value = false;
  }
};

const handleMediaCancel = () => {
  showMediaModal.value = false;
  showDeleteMediaModal.value = false;
  resetMediaForm();
};

// Load initial media data and initialize draggable
onMounted(async () => {
  loadSpots();
  loadAgents();
  loadProgramme();
  loadMedia()

  calendarOptions.value.events = [...programmes.value];


  const ele = document.getElementById('external-events');


if (ele) {
  new Draggable(ele, {
    itemSelector: '.external-event',
    eventData: function (eventEl: any) {
      return {
        title: eventEl.innerText,
        start: new Date(),
        className: eventEl.getAttribute('data-class')
      };
    }
  });
  };
});

// Original Calendar Code
const modal = ref(false);
const eventData = ref();
const isEditEvent = ref(false);
const isDateClick = ref('');

const dateEvent = (e: any) => {
  isDateClick.value = e.date;
  toggleModal();
};

const toggleModal = () => {
  modal.value = !modal.value;
  info.value = false
  v.value.$reset();
  isEditEvent.value = false;
  vuelidateState.date_debut = undefined;
  vuelidateState.date_fin = undefined;
  vuelidateState.agent_id = undefined;
  vuelidateState.spot_publicitaire_id = undefined;
  vuelidateState.chaine_id = undefined;
};

const loadingProgramme2 = ref(false);

const deleteEvent = async () => {

  loadingProgramme2.value = true;
  try{
    await programmeService.delete(eventData.value.id);
    showSuccessMessage('Programme supprimé avec succès');
    eventData.value.remove();
    loadProgramme();
    toggleModal();
  }catch(error) {
    showErrorMessage(error?.message || 'Erreur lors de la suppression');
  }finally {
    loadingProgramme2.value = false;
  }
  

 
};

const programmeId = ref("")

const editEvent = (info: any) => {

  console.log(info) 
  toggleModal();
  isEditEvent.value = true;
  eventData.value = info.event;
  
  programmeId.value = eventData.value.id;
  vuelidateState.date_debut =  dayjs(eventData.value.start).format('YYYY-MM-DD HH:mm:ss')
  vuelidateState.date_fin =  dayjs(eventData.value.end).format('YYYY-MM-DD HH:mm:ss')  
  vuelidateState.agent_id = eventData.value.extendedProps.agent_id;
  vuelidateState.spot_publicitaire_id = eventData.value.extendedProps.spot_id;
  vuelidateState.chaine_id = eventData.value.extendedProps.chaine_id;

  infoSpot.value.nomSpot = eventData.value.extendedProps.nomSpot;
  infoSpot.value.nomAgent = eventData.value.extendedProps.nomAgent;
  infoSpot.value.nomChaine = eventData.value.extendedProps.nomChaine;
  infoSpot.value.dateDebut = dayjs(eventData.value.start).format('YYYY-MM-DD HH:mm:ss');
  infoSpot.value.dateFin = dayjs(eventData.value.end).format('YYYY-MM-DD HH:mm:ss');
  infoSpot.value.tranche_journee = eventData.value.extendedProps.tranche_journee;
  infoSpot.value.statutProgramme = eventData.value.extendedProps.statutProgramme;
  infoSpot.value.spotId = eventData.value.extendedProps.spot_id;

  console.log('infoSpot.value' ,infoSpot.value)

  console.log('eventData.value.extendedProps.spot_id', eventData.value.extendedProps.spot_id)

  getSpotAudio(eventData.value.extendedProps.spot_id)


};

const mediaSelectionnerId = ref("");
const getMediaId = (media) => {
 
  mediaSelectionnerId.value = media
};

const validateProgramForm = (form) => {
  const errors = [];

  if (!form.agent_id || form.agent_id == '') {
    errors.push("Le choix d'un agent est requis.");
  }

  if (!form.spot_publicitaire_id || form.spot_publicitaire_id == '') {
    errors.push("Le choix d'un spot publicitaire est requis.");
  }

 

  return errors;
};

const eventToEdit = ref(null);
const form = ref({
  start: '',
  end: ''
});

const timeModal = ref(false);
const resetFormIntervalle = () => {
  form.value = {
    start: '',
    end: ''
  };
};
const loadingProgramme = ref(false);

const  handleCancelIntervalle = () => {
  timeModal.value = false;
  resetFormIntervalle();
};



function formatDateTimeLocal(date) {
  return new Date(date).toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
}


function openDateConfirmationModal(eventData) {
  eventToEdit.value = {
    id: eventData.eventId,
    start: eventData.start,
    end: eventData.end || null // peut être vide
  };

  form.value.start = formatDateTimeLocal(eventToEdit.value.start);
  form.value.end = eventToEdit.value.end
    ? formatDateTimeLocal(eventToEdit.value.end)
    : '';
    timeModal.value = true;
}


const  onEventDrop = async (info) => {

  eventData.value = info.event;
   
  programmeId.value = eventData.value.id;
  vuelidateState.date_debut =  dayjs(eventData.value.start).format('YYYY-MM-DD HH:mm:ss')
  vuelidateState.date_fin =  dayjs(eventData.value.end).format('YYYY-MM-DD HH:mm:ss')  
  vuelidateState.agent_id = eventData.value.extendedProps.agent_id;
  vuelidateState.spot_publicitaire_id = eventData.value.extendedProps.spot_id;
  vuelidateState.chaine_id = eventData.value.extendedProps.chaine_id;
   

  try {
        await programmeService.update(programmeId.value, {
          date_debut: vuelidateState.date_debut,
          date_fin: vuelidateState.date_fin,
          agent_id: vuelidateState.agent_id,
          spot_publicitaire_id: vuelidateState.spot_publicitaire_id,
          chaine_id: vuelidateState.chaine_id
        });
         
        
        loadProgramme();
        showSuccessMessage('Programme modifié avec succès');

      }catch (error) {
        console.error('Error updating event:', error);
        if (error?.errors) {
          
          showErrorMessage(error.message);
        } else {
          showErrorMessage('Erreur lors de l\'enregistrement');
        }
      }finally {
          loadingProgramme.value = false;
      }
 
}


const onExternalDrop = async (info) => {
  
 
// mediaSelectionnerId.value =  info.draggedEl.getAttribute('data-media-id')

}

const  onEventReceive = async (info) => {
  mediaSelectionnerId.value =  info.draggedEl.getAttribute('data-media-id')
  const event = info.event;
 

  const start = event.start;
  let end = event.start;

  // if (!end && start) {
  //   end = new Date(start);
  //   end.setHours(end.getHours() + 1); // durée par défaut : 1h
  //   event.setEnd(end); // Mise à jour de l'événement
  // }

  form.value.start = start
  form.value.end = end

  handleSubmitProgramme(info)


}

const  handleSubmitProgramme = async (info) => {
 
 
    const formData = {
      date_debut: dayjs(form.value.start).format('YYYY-MM-DD HH:mm:ss'),
      date_fin: dayjs(form.value.end).format('YYYY-MM-DD HH:mm:ss'),
      campagne_id: route.params.campagnesId, // ou récupéré dynamiquement
      agent_id: agentSelectionner.value,
      spot_publicitaire_id: spotSelectionner.value,
      chaine_id: mediaSelectionnerId.value
    };
    
    const errors = validateProgramForm(formData);
   
    if (errors.length > 0) {
      showErrorMessage(errors.join('\n'));

      info.revert();
      return;
    }

    loadingProgramme.value = true;
    try {
      await programmeService.create(formData);
        showSuccessMessage('Programme ajouté avec succès');
        timeModal.value = false;
        loadProgramme();
        resetFormIntervalle();
    } catch (error) {
        if (error?.errors) {
         
          showErrorMessage(error.message);
        } else {
          showErrorMessage('Erreur lors de l\'enregistrement');
        }
      } finally {
        loadingProgramme.value = false;
      }
   
}

const calendarOptions = ref<CalendarOptions>({
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, bootstrapPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  slotDuration: '00:30:00',
  slotMinTime: '07:00:00',
  slotMaxTime: '19:00:00',
  themeSystem: 'bootstrap',
  bootstrapFontAwesome: false,
  buttonText: {
    today: 'Today',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    list: 'List',
    prev: 'Prev',
    next: 'Next'
  },
  handleWindowResize: true,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
  },
  droppable: true,
  editable: true,
  selectable: true,
  events: programmes.value,
  eventDurationEditable : true ,
  eventClick: editEvent,
  dateClick: dateEvent,
  eventDrop: onEventDrop,
  drop: onExternalDrop,
  eventReceive: onEventReceive,
});





const vuelidateState = reactive({
  date_debut: undefined,
  date_fin: undefined,
  agent_id: undefined,
  spot_publicitaire_id: undefined,
  chaine_id: undefined
});

const vuelidateRules = computed(() => ({
  date_debut: { required },
  date_fin: { required },
  agent_id: { required },
  spot_publicitaire_id: { required },
  chaine_id: { required }
}));

const v = useVuelidate(vuelidateRules, vuelidateState);

const fullCalendar = ref();

const handleVuelidateSubmitProgramme = async (event: Event) => {
  event.preventDefault()
  const result = await v.value.$validate();
  if (result) {
    loadingProgramme.value = true;
    try {

      if (!isEditEvent.value) {
        // vuelidateState.date_debut = isDateClick.value || new Date()

        console.log("dateDebut",dayjs(vuelidateState.date_debut).format('YYYY-MM-DD HH:mm:ss') )
        console.log("dateFin",dayjs(vuelidateState.date_fin).format('YYYY-MM-DD HH:mm:ss') )
        
        await programmeService.create({
          date_debut: dayjs(vuelidateState.date_debut).format('YYYY-MM-DD HH:mm:ss') ,
          date_fin: dayjs(vuelidateState.date_fin).format('YYYY-MM-DD HH:mm:ss') ,
          agent_id: vuelidateState.agent_id,
          spot_publicitaire_id: vuelidateState.spot_publicitaire_id,
          chaine_id: vuelidateState.chaine_id,
          campagne_id: route.params.campagnesId
        });
        showSuccessMessage('Programme ajouté avec succès');
        toggleModal();
        loadProgramme();
      }else {
         await programmeService.update(programmeId.value, {
          date_debut: vuelidateState.date_debut,
          date_fin: vuelidateState.date_fin,
          agent_id: vuelidateState.agent_id,
          spot_publicitaire_id: vuelidateState.spot_publicitaire_id,
          chaine_id: vuelidateState.chaine_id      
        });
        isEditEvent.value = false;
        loadingProgramme.value = false;
        toggleModal();
        loadProgramme();
        showSuccessMessage('Programme modifié avec succès');
      }
       

    }catch (error) {
      console.error('Error updating event:', error);
      if (error?.errors) {
        formErrorsSpot.value = error.errors;
        showErrorMessage(error.message);
      } else {
        showErrorMessage('Erreur lors de l\'enregistrement');
      }
    }finally {
          loadingProgramme.value = false;
    }
    // if (!isEditEvent.value) {
    //   const calendarApi = fullCalendar.value?.getApi();
    //   calendarApi.addEvent({
    //     id: (Math.floor(Math.random() * 100 + 20) - 20).toString(),
    //     title: vuelidateState.eventName,
    //     className: vuelidateState.eventCategory,
    //     start: isDateClick.value || new Date()
    //   });
    // } else {
    //   eventData.value.setProp('title', vuelidateState.eventName);
    //   eventData.value.setProp('classNames', [vuelidateState.eventCategory]);
     

    //   loadingProgramme.value = true;


    //   try {
    //     await programmeService.update(programmeId.value, {
    //       date_debut: vuelidateState.date_debut,
    //       date_fin: vuelidateState.date_fin,
    //       agent_id: vuelidateState.agent_id,
    //       spot_publicitaire_id: vuelidateState.spot_publicitaire_id,
    //       chaine_id: vuelidateState.chaine_id
    //     });
    //     isEditEvent.value = false;
    //     loadingProgramme.value = false;
    //     loadProgramme();
    //     showSuccessMessage('Programme modifié avec succès');

    //   }catch (error) {
    //     console.error('Error updating event:', error);
    //     if (error?.errors) {
    //       formErrorsSpot.value = error.errors;
    //       showErrorMessage(error.message);
    //     } else {
    //       showErrorMessage('Erreur lors de l\'enregistrement');
    //     }
    //   }finally {
    //       loadingProgramme.value = false;
    //   }
    // }
    // isDateClick.value = '';
    // toggleModal();
  }
};
</script>
<style scoped >
/* .list-data:hover .action-buttons {
  display: flex !important;
}

.action-buttons {
  background-color: black;
  z-index: 1;
} */
</style>
