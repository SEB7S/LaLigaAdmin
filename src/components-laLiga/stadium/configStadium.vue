<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        placeholder="Search"
        style="width: 200px"
        class="filter-item"
        v-model="search"
        @keyup.enter.native="handleFilter"
      /><!--  
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        v-model="search"
        @click="handleFilter"
      >
        Search
      </el-button> -->
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        {{ $t("table.add") }}
      </el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >
        {{ $t("table.export") }}
      </el-button>
      <el-button
        v-if="showReviewer"
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="danger"
        icon="el-icon-trash"
        @click="deleteAll"
      >
        {{ $t("table.deleteAll") }}
      </el-button>
      <el-button
        v-if="showReviewer && this.stadiumList.length > 0"
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="danger"
        icon="el-icon-trash"
        @click="handleDeleteAll"
      >
        {{ $t("table.delete") }}
      </el-button>
      <el-checkbox
        v-model="showReviewer"
        class="filter-item"
        style="margin-left: 15px"
        @change="tableKey = tableKey + 1"
      >
        {{ $t("table.select") }}
      </el-checkbox>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="stadium"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
    >
      <el-table-column
        v-if="showReviewer"
        :label="$t('table.select')"
        width="110px"
        align="center"
      >
        <template slot-scope="{ row }">
          <el-checkbox
            class="filter-item"
            style="margin-left: 15px"
            @change="isSelected(row, $event)"
          >
          </el-checkbox>
        </template>
      </el-table-column>
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('stadium.nameStadium')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('stadium.cityStadium')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.cityName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('stadium.latitudeStadium')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.latitude }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('stadium.longitudeStadium')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.longitude }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.actions')"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button
            type="primary"
            size="mini"
            @click="handleUpdate(row)"
            icon="el-icon-edit"
          >
          </el-button>
          <el-button
            v-if="row.status != 'deleted'"
            size="mini"
            type="danger"
            @click="confirmDelete(row)"
            icon="el-icon-delete"
          >
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :before-close="handleClose"
      class="mobile"
    >
      <el-steps :active="active" align-center finish-status="success">
        <el-step title="General Data"></el-step>
        <el-step title="Update Images"></el-step>
      </el-steps>
      <div v-if="active == 0">
        <el-form
          ref="formStadium"
          :model="formStadium"
          :rules="rules"
          label-position="top"
          label-width="100px"
          style="margin: 30px"
        >
          <el-form-item :label="$t('stadium.nameStadium')" prop="name">
            <el-input v-model="formStadium.name" />
          </el-form-item>
          <el-form-item :label="$t('stadium.latitudeStadium')" prop="latitude">
            <el-input v-model="formStadium.latitude" />
          </el-form-item>
          <el-form-item
            :label="$t('stadium.longitudeStadium')"
            prop="longitude"
          >
            <el-input v-model="formStadium.longitude" />
          </el-form-item>
          <el-form-item :label="$t('stadium.cityStadium')" prop="city_name">
            <el-autocomplete
              v-model="formStadium.city_name"
              popper-class="my-autocomplete"
              :fetch-suggestions="getCities"
              placeholder="Please input"
              style="width: 100%"
              @select="handleSelect"
            >
              <i
                slot="suffix"
                class="el-icon-edit el-input__icon"
                @click="handleIconClick"
              />
              <template slot-scope="{ item }">
                <div class="value">{{ item.nameEnglish }}</div>
              </template>
            </el-autocomplete>
          </el-form-item>
          <el-form-item
            :label="$t('stadium.categoryStadium')"
            prop="categoryStadium"
          >
            <el-select
              v-model="formStadium.categoryStadium"
              multiple
              filterable
              placeholder="Select"
              style="width: 100%"
            >
              <el-option
                v-for="item in formStadium.options"
                :key="item.id"
                :label="item.nameEnglish"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div v-if="active == 1">
        <el-form
          ref="formHotel"
          label-position="top"
          label-width="120px"
          style="margin: 30px"
        >
          <el-form-item :label="$t('stadium.image')">
            <el-upload
              :action="url + 'StadiumMediaContent/SendStadiumImage'"
              list-type="picture-card"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
              :file-list="fileList"
              name="UploadImage"
              :data="formImageStadium"
              :on-success="handleSuccess"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
          </el-form-item>
        </el-form>

        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t("table.cancel") }}
        </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? postStadium() : updateData()"
        >
          {{ $t("table.confirm") }}
        </el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table
        :data="pvData"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">
          Confirm
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  fetchList,
  fetchPv,
  createArticle,
  updateArticle,
} from "@/api/article";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
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
  name: "ConfigStadium",
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: "success",
        draft: "info",
        deleted: "danger",
      };
      return statusMap[status];
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type];
    },
  },
  data() {
    var validateNumber = (rule, value, callback) => {
      if (isNaN(value)) {
        callback(new Error("Please input numbers"));
      } else {
        callback();
      }
    };
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: "+id",
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [
        { label: "ID Ascending", key: "+id" },
        { label: "ID Descending", key: "-id" },
      ],
      statusOptions: ["published", "draft", "deleted"],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: "",
        timestamp: new Date(),
        title: "",
        type: "",
        status: "published",
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "Edit",
        create: "Create",
      },
      dialogPvVisible: false,
      pvData: [],

      downloadLoading: false,
      /** FormCity  */
      city_name: "",
      city_nameEs: "",
      cities: [],
      /** FormStadium */
      formStadium: {
        name: "",
        latitude: "",
        longitude: "",
        cityId: "",
        city_name: "",
        categoryStadium: [],
        options: [],
      },
      stadiumUpdate: [],
      /* for update form */
      categoryStadiumUpdate: [],
      search: "",
      active: 0,
      formImageStadium: {
        MediaContentType: 0,
        idStadium: 0,
        id: null,
      },
      /* EndPoint */
      url: this.$store.getters.url,
      rules: {
        name: [
          {
            required: true,
            message: "Please input name",
            trigger: "change",
          },
          {
            min: 3,
            message: "Length should be 3",
            trigger: "blur",
          },
        ],
        latitude: [
          {
            message: "Please input latitude",
            trigger: "blur",
          },
          {
            min: 3,
            message: "Length should be 3",
            trigger: "blur",
          },
          {
            validator: validateNumber,
            trigger: "blur",
          },
        ],
        longitude: [
          {
            message: "Please input longitude",
            trigger: "blur",
          },
          {
            min: 3,
            message: "Length should be 3",
            trigger: "blur",
          },
          {
            validator: validateNumber,
            trigger: "blur",
          },
        ],
        city_name: [
          {
            required: true,
            message: "Please input city",
            trigger: "change",
          },
        ],
        categoryStadium: [
          {
            required: true,
            message: "Please input category",
            trigger: "change",
          },
        ],
      },
      /* Images */
      dialogImageUrl: "",
      dialogVisible: false,
      fileList: [],
      stadiumList: [],
    };
  },
  created() {
    /*     this.getList(); */
    this.getStadium();
  },
  methods: {
    getList() {
      this.listLoading = true;
      fetchList(this.listQuery).then((response) => {
        this.list = response.data.items;
        this.total = response.data.total;

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 1000);
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getStadium();
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: "操作Success",
        type: "success",
      });
      row.status = status;
    },
    sortChange(data) {
      const { prop, order } = data;
      if (prop === "id") {
        this.sortByID(order);
      }
    },
    sortByID(order) {
      if (order === "ascending") {
        this.listQuery.sort = "+id";
      } else {
        this.listQuery.sort = "-id";
      }
      this.handleFilter();
    },
    handleFetchPv(pv) {
      fetchPv(pv).then((response) => {
        this.pvData = response.data.pvData;
        this.dialogPvVisible = true;
      });
    },
    formatJson(filterVal) {
      return this.list.map((v) =>
        filterVal.map((j) => {
          if (j === "timestamp") {
            return parseTime(v[j]);
          } else {
            return v[j];
          }
        })
      );
    },
    getSortClass: function (key) {
      /*       const sort = this.listQuery.sort;
      return sort === `+${key}` ? "ascending" : "descending"; */
    },

    /* STADIUM */
    handleDownload() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = ["id", "name", "cityName", "longitude", "latitude"];
        const filterVal = ["id", "name", "cityName", "longitude", "latitude"];
        const data = this.formatJson(filterVal);
        const date = new Date();
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "Stadiums" + date,
        });
        this.downloadLoading = false;
      });
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.active = 0;
    },
    resetTemp() {
      (this.formStadium = {
        name: "",
        latitude: "",
        longitude: "",
        cityId: "",
        city_name: "",
        categoryStadium: [],
        options: [],
      }),
        (this.city_name = "");
      this.fileList = [];
      this.categoryStadiumUpdate = [];
      this.getCategoryStadium();
    },
    /* POST */
    postStadium() {
      if (this.active == 0) {
        this.$refs["formStadium"].validate((valid) => {
          var stadium = {
            stadiumName: this.formStadium.name,
            latitude: this.formStadium.latitude,
            longitude: this.formStadium.longitude,
            cityId: this.formStadium.cityId,
            stadiumStadiumCategories: [],
          };
          this.formStadium.categoryStadium.forEach((element) => {
            console.log(element);
            stadium.stadiumStadiumCategories.push({
              stadiumId: 0,
              stadiumCategoryId: element,
            });
          });
          if (valid) {
            axios
              .post(this.url + "Stadium", stadium)
              .then((response) => {
                this.formImageStadium.idStadium = response.data.id;
                this.next();
                this.$notify({
                  title: "Success",
                  message: "Estadio Agregado con éxito",
                  type: "success",
                  duration: 2000,
                });
                this.getStadium();
              })
              .catch((error) => {
                console.error(error.response);
              });
          }
        });
      } else {
        this.dialogFormVisible = false;
      }
    },
    /* GET */
    getStadium() {
      this.listLoading = true;
      axios
        .get(this.url + "Stadium")
        .then((response) => {
          console.log(response.data);
          this.list = response.data;
          this.listLoading = false;
          console.log("lista:", this.stadiumList);
        })
        .catch((error) => {
          this.status = "error";
        });
    },
    getCategoryStadium() {
      axios
        .get(this.url + "StadiumCategory")
        .then((response) => {
          this.formStadium.options = response.data;
          console.log(this.formStadium);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    /* DELETE */
    handleDelete(row, selected) {
      var id = selected ? row : row.id;
      axios
        .delete(this.url + "Stadium/" + id)
        .then((response) => {
          this.$notify({
            title: "Success",
            message: "Delete Successfully",
            type: "success",
            duration: 2000,
          });
          this.getStadium();
          this.showReviewer = false;
          this.stadiumList = [];
        })
        .catch((error) => {
          console.error(error.response.data);
          this.$notify({
            title: "Error",
            message: "No es posible eliminar por que se está usando en otros módulos",
            type: "error",
            duration: 3000,
          });
        });
    },
    confirmDelete(row) {
      this.$confirm(
        "This will permanently delete the file. Continue?",
        "Warning",
        {
          confirmButtonText: "OK",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      )
        .then(() => {
          this.handleDelete(row, false);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "Delete canceled",
          });
        });
    },
    isSelected(arr, select) {
      console.log(select);
      if (select) {
        this.stadiumList.push(arr.id);
      } else {
        this.removeItemFromArr(this.stadiumList, arr.id);
      }
      console.log(this.stadiumList);
    },
    removeItemFromArr(arr, item) {
      var i = arr.indexOf(item);

      if (i !== -1) {
        arr.splice(i, 1);
      }
    },
    handleDeleteAll() {
      /* delet duplicated id's */
      console.log(this.stadiumList);
      const clearList = [...new Set(this.stadiumList)];
      console.log(clearList);
      clearList.forEach((value) => {
        console.log(value);
        this.handleDelete(value, true);
      });
    },
    deleteAll() {
      this.$confirm(
        "This will permanently delete the file. Continue?",
        "Warning",
        {
          confirmButtonText: "OK",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      )
        .then(() => {
          this.list.forEach((value) => {
            this.handleDelete(value, false);
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "Delete canceled",
          });
        });
    },
    /* UPDATE */
    handleUpdate(row) {
      this.resetTemp();
      this.getImageByIdStadium(row);
      console.log(row);
      this.active = 0;
      this.stadiumUpdate = row;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.formStadium.name = row.name;
      this.formStadium.latitude = row.latitude;
      this.formStadium.longitude = row.longitude;
      this.formStadium.city_name = row.cityName;
      this.formStadium.cityId = row.cityId;
      this.formImageStadium.idStadium = row.id;
      this.formStadium.options = row.stadiumCategories;
      row.stadiumCategories.forEach((element) => {
        this.formStadium.categoryStadium.push(element.stadiumCategoryId);
      });
    },
    updateData() {
      if (this.active == 0) {
        this.$refs["formStadium"].validate((valid) => {
          if (valid) {
            var stadium = {
              id: this.stadiumUpdate.id,
              cityId: this.formStadium.cityId,
              name: this.formStadium.name,
              latitude: this.formStadium.latitude,
              longitude: this.formStadium.longitude,
              stadiumStadiumCategories: [],
            };
            console.log(this.formStadium.categoryStadium);
            if (this.categoryStadiumUpdate.length == 0) {
              this.formStadium.categoryStadium.forEach((element) => {
                stadium.stadiumStadiumCategories.push({
                  stadiumId: 0,
                  stadiumCategoryId: element,
                });
              });
            } else {
              this.categoryStadiumUpdate.forEach((element) => {
                console.log("sss", element);
                stadium.stadiumStadiumCategories.push({
                  stadiumId: 0,
                  stadiumCategoryId: element,
                });
              });
            }

            axios
              .put(this.url + "Stadium", stadium)
              .then((response) => {
                this.next();
                this.$notify({
                  title: "Success",
                  message: "Update Successfully",
                  type: "success",
                  duration: 2000,
                });

                this.getStadium();
              })
              .catch((error) => {
                console.error(error.response);
              });
          }
        });
      } else if (this.active == 1) {
        this.dialogFormVisible = false;
      }
    },
    /* CITIES */
    getCities(queryString, cb) {
      axios
        .get(this.url + "City")
        .then((response) => {
          console.log(response.data);
          var links = response.data;
          var results = queryString
            ? links.filter(this.createFilter(queryString))
            : links;
          cb(results);
        })
        .catch((error) => {
          this.status = "error";
        });
    },
    createFilter(queryString) {
      return (link) => {
        return (
          link.nameEnglish.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        );
      };
    },
    handleSelect(item) {
      console.log(item);
      this.formStadium.city_name = item.nameEnglish;
      this.formStadium.cityId = item.id;
    },
    handleIconClick(ev) {
      console.log(ev);
    },
    /* CATEGORY STADIUM */

    /* IMAGES */
    handleRemove(file, fileList) {
      console.log(file, fileList);
      axios
        .delete(this.url + "StadiumMediaImage/DeleteStadiumMedia?id=" + file.id)
        .then((response) => {
          this.$notify({
            title: "Success",
            message: "Delete Successfully",
            type: "success",
            duration: 2000,
          });
        })
        .catch((error) => {
          console.error(error.response);
        });
    },
    handleSuccess(response, file, fileList) {
      this.formImageStadium.id = response.id;
      console.log(this.formImageStadium.id, response);
    },
    handlePictureCardPreview(file) {
      console.log(file);
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleClose(done) {
      this.$confirm("Are you sure to close this form?")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
    getImageByIdStadium(stadium) {
      axios
        .get(
          this.url + "StadiumMediaImage/GetAllByStadium?idStadium=" + stadium.id
        )
        .then((response) => {
          console.log(response.data);
          this.fileList = response.data;
        })
        .catch((error) => {
          this.status = "error";
        });
    },
    /* OTHER */
    next() {
      /* Change step in form */
      if (this.active++ > 1) this.active = 0;
    },
  },
  computed: {
    stadium() {
      if (this.list.length > 0) {
        return this.list.filter((item) => {
          return (
            item.name.toLowerCase().includes(this.search.toLowerCase()) ||
            item.cityName.toLowerCase().includes(this.search.toLowerCase()) ||
            item.latitude.toLowerCase().includes(this.search.toLowerCase()) ||
            item.longitude.toLowerCase().includes(this.search.toLowerCase())
          );
        });
      }
    },
  },
};
</script>
<style lang="scss">
@media (max-width: 600px) {
  .el-dialog {
    width: 100% !important;
  }
}
</style>