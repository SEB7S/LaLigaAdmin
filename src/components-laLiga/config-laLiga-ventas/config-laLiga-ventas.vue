<template>
  <div class="app-container">
    <el-tabs type="card" @tab-click="handleClick">
      <el-tab-pane label="Dashboard">
        <el-row type="flex">
          <el-col :xs="24" :sm="24" :md="9" :lg="11" :xl="11">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>Partidos Destacados</span>
                <el-select
                  v-model="value"
                  placeholder="Select"
                  style="float: right;"
                  @change="onSelect"
                >
                  <el-option
                    v-for="(item, index) in options"
                    :key="index"
                    :label="item.name"
                    :value="item"
                  >
                  </el-option>
                </el-select>
              </div>
              <div class="text item">
                <el-form
                  ref="formDashboard"
                  :rules="rules"
                  :model="formDashboard"
                  label-position="top"
                >
                  <el-switch
                    v-model="formDashboard.isActive"
                    @change="updateData"
                  >
                  </el-switch>

                  <el-form-item :label="$t('config.name')">
                    <el-input
                      placeholder="Please input"
                      v-model="formDashboard.name"
                      maxlength="20"
                      show-word-limit
                    ></el-input>
                  </el-form-item>
                  <el-form-item :label="$t('config.titleDashboardEn')">
                    <el-input
                      placeholder="Inglés"
                      v-model="formDashboard.tituloEnglish"
                      maxlength="64"
                      show-word-limit
                    ></el-input>
                  </el-form-item>
                  <el-form-item :label="$t('config.titleDashboardEs')">
                    <el-input
                      placeholder="Español"
                      v-model="formDashboard.tituloSpanish"
                      maxlength="64"
                      show-word-limit
                    ></el-input>
                  </el-form-item>
                  <el-form-item :label="$t('config.color')">
                    <el-color-picker
                      v-model="formDashboard.color"
                      show-alpha
                    ></el-color-picker>
                    <p>Resultado:</p>

                    <h2 :style="{ color: formDashboard.color }">
                      {{ formDashboard.tituloEnglish }}
                    </h2>
                    <h2 :style="{ color: formDashboard.color }">
                      {{ formDashboard.tituloSpanish }}
                    </h2>
                  </el-form-item>
                  <el-form-item :label="$t('config.numberMatch')">
                    <el-slider
                      v-model="formDashboard.totalDisplay"
                      show-input
                      :max="4"
                    >
                    </el-slider>
                  </el-form-item>
                  <el-form-item :label="$t('config.numberMatchTotal')">
                    <el-slider
                      v-model="formDashboard.totalCarrusel"
                      show-input
                      :max="8"
                    ></el-slider>
                  </el-form-item>
                  <el-form-item
                    :disabled="!dialogFormVisible"
                    :label="$t('config.imageDashboard')"
                  >
                    <el-upload
                      class="upload-demo"
                      action=""
                      :on-preview="handlePreview"
                      :on-remove="handleRemove"
                      :http-request="uploadFile"
                      :file-list="fileList"
                      :data="formImageDashboard"
                      name="UploadImage"
                      list-type="picture"
                      :on-success="handleSuccess"
                    >
                      <el-button size="small" type="primary"
                        >Clic para subir archivo</el-button
                      >
                      <!-- <div slot="tip" class="el-upload__tip">
                    Solo archivos jpg/png con un tamaño menor de 500kb
                  </div> -->
                    </el-upload>
                  </el-form-item>
                </el-form>
                <el-button
                  type="primary"
                  size="medium"
                  class="btn"
                  :loading="dialogFormVisible"
                  @click="handleCreate"
                  >{{ statusButton }}</el-button
                >
              </div>
            </el-card>
          </el-col>
          <el-col :xs="20" :sm="20" :md="9" :lg="11" :xl="11">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>Ordenar Partidos</span>
                <el-popover
                  placement="right"
                  title="Ayuda"
                  width="200"
                  trigger="click"
                  content="Este será el orden en el cual los partidos destacados se mostrarán en la plataforma."
                >
                  <i
                    class="el-icon-question"
                    slot="reference"
                    style="float: right; padding: 3px 0;"
                  ></i>
                </el-popover>
              </div>
              <el-collapse v-model="activeNames">
                <draggable
                  :list="list"
                  :disabled="!enabled"
                  class="list-group"
                  ghost-class="ghost"
                  :move="checkMove"
                  @start="dragging = true"
                  @end="dragging = false"
                >
                  <!--                   <el-card
                    shadow="hover"
                    class="list-group-item clearfix"
                    v-for="(element, index) in list"
                    :key="element.name"
                  >
                    <i
                      class="el-icon-rank"
                      style="float: right; padding: 3px 0"
                    ></i>
                    <strong>{{ index + 1 }}.</strong> {{ element.name }}
                  </el-card> -->
                  <el-collapse-item
                    shadow="hover"
                    class="list-group-item clearfix"
                    v-for="(element, index) in list"
                    :key="element.id"
                    :title="index + 1 + '.' + element.clubs"
                    :name="index"
                  >
                    <ul>
                      <li>
                        <el-tag
                          ><strong>fecha:</strong>
                          {{ element.date | formatDate }}</el-tag
                        >
                      </li>
                      <li>
                        <el-tag
                          ><strong>torneo:</strong>
                          {{ element.tournamentName }}</el-tag
                        >
                      </li>
                      <li>
                        <el-tag
                          ><strong>estadio:</strong>
                          {{ element.stadiumName }}</el-tag
                        >
                      </li>
                    </ul>
                  </el-collapse-item>
                </draggable>
              </el-collapse>

              <el-button
                type="primary"
                size="medium"
                class="btn"
                :loading="dialogFormVisible"
                @click="deleteSortedtMatch"
                >Actualizar</el-button
              >
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="Itinerario">
        <el-row type="flex">
          <el-col :xs="24" :sm="24" :md="9" :lg="11" :xl="11">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>Gestionar Descripción</span>
              </div>
              <div class="text item">
                <el-form
                  ref="formItinerary"
                  :rules="rules"
                  :model="formItinerary"
                  label-position="top"
                >
                  <el-form-item :label="$t('config.descriptionItEn')">
                    <el-input
                      type="textarea"
                      placeholder="Please input"
                      v-model="formItinerary.generalDescriptionEnglish"
                      maxlength="250"
                      show-word-limit
                    ></el-input>
                  </el-form-item>
                  <el-form-item :label="$t('config.descriptionItEs')">
                    <el-input
                      type="textarea"
                      placeholder="Please input"
                      v-model="formItinerary.generalDescriptionSpanish"
                      maxlength="150"
                      show-word-limit
                    ></el-input>
                  </el-form-item>
                  <el-form-item :label="$t('config.conditionsEn')">
                    <el-input
                      type="textarea"
                      placeholder="Please input"
                      v-model="formItinerary.conditionsEnglish"
                      maxlength="150"
                      show-word-limit
                    ></el-input>
                  </el-form-item>
                  <el-form-item :label="$t('config.conditionsEs')">
                    <el-input
                      type="textarea"
                      placeholder="Please input"
                      v-model="formItinerary.conditionsSpanish"
                      maxlength="150"
                      show-word-limit
                    ></el-input>
                  </el-form-item>
                </el-form>
                <el-button
                  type="primary"
                  size="medium"
                  class="btn"
                  :loading="dialogFormVisible"
                  @click="deleteItinerary"
                  >{{ statusButton }}</el-button
                >
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="Distribución de habitaciones"
        >Distribución de habitaciones</el-tab-pane
      >
      <el-tab-pane label="Config4">Config 4</el-tab-pane>
    </el-tabs>
    <div></div>
  </div>
</template>
<script>
import {
  fetchList,
  fetchPv,
  createArticle,
  updateArticle,
} from "@/api/article";
import draggable from "vuedraggable";
import i18n from "@/lang/index.js";
import waves from "@/directive/waves"; // waves directive
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import axios from "axios";
const calendarTypeOptions = [
  { key: "CN", display_name: "China" },
  { key: "US", display_name: "USA" },
  { key: "JP", display_name: "Japan" },
  { key: "EU", display_name: "Eurozone" },
];

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name;
  return acc;
}, {});

export default {
  matchNumbers: "Config",
  components: { Pagination, draggable },
  directives: { waves },

  data() {
    return {
      dialogFormVisible: false,
      dialogStatus: "",
      rules: {
        type: [
          { required: true, message: "type is required", trigger: "change" },
        ],
        timestamp: [
          {
            type: "date",
            required: true,
            message: "timestamp is required",
            trigger: "change",
          },
        ],
        title: [
          { required: true, message: "title is required", trigger: "blur" },
        ],
      },
      list: [],
      dragging: false,
      enabled: true,
      activeNames: ["1"],
      options: [],
      value: "Option1",

      /** FormConfig */
      formDashboard: {
        totalCarrusel: 8,
        totalDisplay: 4,
        tituloSpanish: "",
        tituloEnglish: "",
        color: "",
        name: "Config",
        isActive: false,
      },
      formItinerary: {
        generalDescriptionSpanish: "",
        generalDescriptionEnglish: "",
        conditionsSpanish: "",
        conditionsEnglish: "",
      },
      statusButton: i18n.t("config.statusButtonSave"),
      ConfigUpdate: [],
      activeName: "first",
      /* EndPoint */
      url: this.$store.getters.url,
      formImageDashboard: {
        MediaContentType: 0,
        IdMatchFront: 0,
        id: 0,
      },
      aImageDashboard: [],
      fileList: [],
    };
  },
  created() {
    this.getConfig();
    this.getSortedMatch();
    this.getItinerary();
  },
  computed: {
    draggingInfo() {
      return this.dragging ? "under drag" : "";
    },
  },
  methods: {
    resetTemp() {},
    handleUpdate(row) {},
    /* GESTIONAR CONFIGURACION */
    /* AL CAMBIAR DE CONFIGURACION */
    onSelect(e) {
      this.fileList = [];
      console.log(e);
      this.value = e.name;
      this.formDashboard = e;
      if (!e.isEmpty) {
        this.statusButton = i18n.t("config.statusButtonUpdate");
        this.getImageByIdDashboard(e.matchFrontId);
      } else {
        this.statusButton = i18n.t("config.statusButtonSave");
      }
    },
    handleCreate() {
      if (this.formDashboard.isEmpty) {
        this.postConfig();
      } else {
        this.updateData();
      }
    },
    /* DASHBOARD */
    postConfig() {
      this.$refs["formDashboard"].validate((valid) => {
        if (valid) {
          this.dialogFormVisible = true;
          axios
            .post(this.url + "MatchFront", this.formDashboard)
            .then((response) => {
              this.dialogFormVisible = false;
              this.$notify({
                title: i18n.t("notifications.success"),
                message: i18n.t("notifications.cathegoryAddedSuccess"),
                type: "success",
                duration: 2000,
              });
              this.formImageDashboard.IdMatchFront = response.data.matchFrontId;
              console.log(response.data);

              if (this.aImageDashboard.length > 0) {
                this.postImageDashboard();
              } else {
                this.getConfig();
              }

              this.resetForm("formDashboard");
            })
            .catch((error) => {
              console.error(error.response);
            });
        }
      });
    },
    updateData() {
      if (!this.formDashboard.isEmpty) {
        console.log("entré");
        axios
          .put(this.url + "MatchFront", this.formDashboard)
          .then((response) => {
            this.dialogFormVisible = false;
            this.$notify({
              title: i18n.t("notifications.success"),
              message: i18n.t("notifications.updateSuccess"),
              type: "success",
              duration: 2000,
            });
            this.formImageDashboard.IdMatchFront = this.formDashboard.matchFrontId;
            console.log(this.formDashboard.matchFrontId);
            this.postImageDashboard();
            this.getConfig();
          })
          .catch((error) => {
            console.error(error.response);
          });
      }
    },
    getConfig() {
      this.fileList = [];
      this.listLoading = true;
      axios
        .get(this.url + "MatchFront")
        .then((response) => {
          console.log(response.data);
          let data = 5 - response.data.length; //Verificando cuantos datos vienen en la peticion
          this.options = response.data;

          if (data != 0) {
            //si data=0 significa que ya hay 5 configuraciones hechas
            console.log(data);
            for (var i = 0; i < data; i++) {
              this.options.push({
                totalCarrusel: 8,
                totalDisplay: 4,
                tituloSpanishSpanish: "",
                color: "",
                isActive: false,
                isEmpty: true,
                name: "---none" + (i + 1) + "---",
              });
            }
            this.getImageByIdDashboard(this.options[0].matchFrontId);
          }
          console.log(this.options);
          this.formDashboard = this.options[0];
          this.value = this.options[0].name;

          if (!this.formDashboard.isEmpty) {
            this.statusButton = i18n.t("config.statusButtonUpdate");
          }
        })
        .catch((error) => {
          this.status = "error";
        });
    },
    handleDelete(row) {
      axios
        .delete(this.url + "Config/" + row.id)
        .then((response) => {
          this.$notify({
            title: i18n.t("notifications.success"),
            message: i18n.t("notifications.deleteSuccessfully"),
            type: "success",
            duration: 2000,
          });
          this.getConfig();
        })
        .catch((error) => {
          console.error(error.response);
        });
    },
    confirmDelete(id) {
      this.$confirm(
        i18n.t("modals.deleteItemWarning"),
        i18n.t("modals.warning"),
        {
          confirmButtonText: i18n.t("modals.confirmButton"),
          cancelButtonText: i18n.t("modals.cancelButton"),
          type: "warning",
        }
      )
        .then((resp) => {
          console.log(resp);
          this.$message({
            type: "success",
            message: i18n.t("notifications.deleteComplete"),
          });
          this.deleteMatchImage(id);
        })
        .catch((action) => {
          console.log(action);
          this.$message({
            type: "info",
            message: i18n.t("notifications.deleteCanceled"),
          });
          this.getImageByIdDashboard(this.formDashboard.matchFrontId);
        });
    },
    /* SUBIENDO IMAGENES DEL DASHBOARD */
    getImageByIdDashboard(id) {
      this.fileList = [];
      axios
        .get(this.url + "GetMatchFrontImage")
        .then((response) => {
          console.log(response.data);
          this.fileList = response.data.filter((img, index) => {
            img.name = "image" + index;
            return img.matchFrontConfigurationId == id;
          });
        })
        .catch((error) => {
          this.status = "error";
        });
    },
    handleSuccess(response, file, fileList) {
      this.formImageDashboard.id = response.id;
    },
    uploadFile(file) {
      console.log(file);
      this.aImageDashboard.push(file);
    },
    removeImageFromaImageDashboard() {},

    postImageDashboard() {
      if (this.aImageDashboard.length > 0) {
        this.aImageDashboard.forEach((element, index) => {
          var formData = new FormData();
          formData.append("MediaContentType", 0);
          formData.append("IdMatchFront", this.formImageDashboard.IdMatchFront);
          formData.append("UploadImage", element.file);
          axios
            .post(
              this.url + "MatchFrontMediaContent/SendMatchFrontImage",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            )
            .then((response) => {
              this.getConfig();
              delete this.aImageDashboard[index];
              console.log(this.aImageDashboard);
            })
            .catch((error) => {
              console.error(error.response);
            });
        });
      }
    },
    handleRemove(file, fileList) {
      if (file.id) {
        this.confirmDelete(file.id);
      }
      this.aImageDashboard.forEach((element, index) => {
        console.log(element, element.file.uid, file.uid);
        if (element.file.uid == file.uid) {
          delete this.aImageDashboard[index];
        }
      });
      console.log(file, fileList, this.aImageDashboard);
    },
    deleteMatchImage(id) {
      axios
        .delete(
          this.url + "MatchFrontMediaImage/DeleteMatchFrontMedia?id=" + id
        )
        .then((response) => {
          this.getImageByIdDashboard(this.formDashboard.matchFrontId);
        })
        .catch((error) => {
          console.error(error.response);
        });
    },
    handlePreview(file) {
      console.log(file);
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    /* PARA ORDENAR LOS PARTIDOS */
    postSortedMatch() {
      this.dialogFormVisible = true;
      this.list.forEach((element, index) => {
        element.order = index;
      });
      console.log(this.list);
      axios
        .post(this.url + "MatchFrontDashboard", this.list)
        .then((response) => {
          this.dialogFormVisible = false;
          this.$notify({
            title: i18n.t("notifications.success"),
            message: i18n.t("notifications.cathegoryAddedSuccess"),
            type: "success",
            duration: 2000,
          });
          /* this.getSortMatch(); */
          this.resetForm("formDashboard");
        })
        .catch((error) => {
          console.error(error.response);
        });
    },
    getSortedMatch() {
      axios
        .get(this.url + "MatchFrontDashboard")
        .then((response) => {
          console.log(response.data);
          if (response.data.length > 0) {
            this.list = response.data;
          } else {
            this.getMatch();
          }
        })
        .catch((error) => {
          this.status = "error";
        });
    },
    getMatch() {
      axios
        .get(this.url + "Match")
        .then((response) => {
          console.log(response.data);
          let order = 0;
          this.list = response.data.filter((element, index) => {
            if (element.destacado) {
              element.order = order;
              order++;
            }
            return element.destacado == true;
          });

          console.log(this.list);
        })
        .catch((error) => {
          this.status = "error";
        });
    },
    deleteSortedtMatch() {
      axios
        .delete(this.url + "MatchFrontDashboard/DeleteAllMatchFrontDashboard/")
        .then((response) => {
          this.postSortedMatch();
        })
        .catch((error) => {
          console.error(error.response);
        });
    },
    /* EVENTO QUE SE DISPARA AL MOVER UN PARTIDO */
    checkMove: async function (e) {
      /*     console.log("Future index: " + e.draggedContext.futureIndex, this.list , e); */
      e.draggedContext.element.order = e.draggedContext.futureIndex;
      console.log("list: ", this.list);
    },

    /* FIN DASHBOARD */

    /* ITINERARIO */
    postItinerary() {
      this.$refs["formItinerary"].validate((valid) => {
        if (valid) {
          this.dialogFormVisible = true;
          axios
            .post(this.url + "ItineraryFrontDashboard", this.formItinerary)
            .then((response) => {
              this.dialogFormVisible = false;
              this.$notify({
                title: i18n.t("notifications.success"),
                message: i18n.t("notifications.cathegoryAddedSuccess"),
                type: "success",
                duration: 2000,
              });
              this.getItinerary();
            })
            .catch((error) => {
              console.error(error.response);
            });
        }
      });
    },
    getItinerary() {
      axios
        .get(this.url + "ItineraryFrontDashboard")
        .then((response) => {
          console.log(response.data);
          this.formItinerary = response.data[0];
        })
        .catch((error) => {
          this.status = "error";
        });
    },
    deleteItinerary() {
      axios
        .delete(
          this.url + "ItineraryFrontDashboard/DeleteAllItineraryFrontDashboard"
        )
        .then((response) => {
          this.postItinerary();
        })
        .catch((error) => {
          console.error(error.response);
        });
    },
  },
};
</script>
<style lang="scss">
.box-card {
  width: 480px; // tamañano de las cards
}
.btn {
  width: 100%; //Tamaño boton de guardar
}
.ghost {
  //al arrastrar un partido
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
