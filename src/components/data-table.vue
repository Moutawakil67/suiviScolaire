<template>
    <div>
      <div ref="tableContainer"></div>
      <div class="mt-3">
        <p>Débogage:</p>
        <pre ref="debugOutput"></pre>
      </div>
    </div>
  </template>
  
  <script>
  import { Tabulator } from 'tabulator-tables/dist/js/tabulator_esm.js';
  import 'tabulator-tables/dist/css/tabulator.min.css';
  // Si vous utilisez Bootstrap, assurez-vous d'importer ses styles
  import 'bootstrap/dist/css/bootstrap.min.css';
  
  export default {
    name: 'DataTable',
    props: {
      tableData: {
        type: Array,
        default: () => [
          { id: 1, name: "Test 1", age: 25 },
          { id: 2, name: "Test 2", age: 30 }
        ]
      }
    },
    data() {
      return {
        table: null
      };
    },
    mounted() {
      this.initTable();
      
      // Délai pour permettre au tableau de se rendre
      setTimeout(() => {
        this.debugTableContent();
      }, 1000);
    },
    methods: {
      initTable() {
        const self = this;
        
        this.table = new Tabulator(this.$refs.tableContainer, {
          data: this.tableData,
          layout: "fitColumns",
          // Désactivons responsive pour le debug
          // responsiveLayout: "hide",
          columns: [
            { title: "ID", field: "id" },
            { title: "Nom", field: "name", sorter: "string" },
            { title: "Âge", field: "age", sorter: "number" },
            {
            title: "Actions",
            formatter: "html",
            field: "actions", // Important d'avoir un champ
            // Au lieu de formatterParams, définissons directement le contenu HTML
            formatter: function(cell, formatterParams, onRendered) {
                return "<button class='btn btn-sm btn-primary'>Éditer</button>";
            },
            width: 150,
            hozAlign: "center",
            headerSort: false
            }
          ],
          renderComplete: function() {
          
            self.debugTableContent();
          }
        });
      },
      
      debugTableContent() {
        // Vérifions si les cellules d'actions sont bien créées
        const cells = this.$refs.tableContainer.querySelectorAll('.tabulator-cell');
       
        
        let debug = '';
        cells.forEach((cell, index) => {
          debug += `Cellule ${index}: ${cell.innerHTML.substring(0, 50)}...\n`;
        });
        
        if (this.$refs.debugOutput) {
          this.$refs.debugOutput.textContent = debug;
        }
        
        // Vérifier spécifiquement les boutons
        const buttons = this.$refs.tableContainer.querySelectorAll('button');
        
      }
    }
  }
  </script>
  
  <style>
  /* Assurez-vous que les styles ne sont pas en conflit */
  .tabulator .tabulator-cell {
    padding: 8px;
    vertical-align: middle;
  }
  
  /* Donnez plus d'espace pour les boutons */
  .tabulator .btn {
    margin: 2px;
    display: inline-block;
  }
  </style>