<template>
  <div class="app-container">
    <div class="filter-container">
      <!--       <el-input
        placeholder="Nombre En"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
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
        v-if="showReviewer && this.tourList.length > 0"
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
      :data="list"
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
        :label="$t('tour.nameTour')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('tour.nameProvider')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.providerName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('tour.durationTour')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.duration_in_days }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('tour.status')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.status"
            active-color="#619b97"
            inactive-color="#f5365c"
            @change="changeStatus(row, $event)"
          />
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
    >
      <div>
        <el-steps :active="active" finish-status="success" align-center>
          <el-step :title="$t('tour.nameTour')" icon="el-icon-edit" />
          <el-step :title="$t('tour.stepTwoName')" icon="el-icon-date" />
        </el-steps>
      </div>
      <div style="margin-top: 60px; padding: 25px">
        <div v-if="active == 0">
          <el-form
            ref="dataForm"
            :rules="rules"
            :model="temp"
            label-position="top"
            label-width="120px"
          >
            <el-form-item :label="$t('tour.nameTour')">
              <el-input v-model="formTour.name" />
            </el-form-item>
            <el-form-item :label="$t('tour.durationTour')">
              <el-input-number
                v-model="formTour.duration_in_days"
                :min="1"
                :max="35"
              />
            </el-form-item>
            <el-form-item :label="$t('tour.nameProvider')">
              <el-autocomplete
                v-model="formTour.providerName"
                popper-class="my-autocomplete"
                :fetch-suggestions="getProviders"
                placeholder="Please input"
                style="width: 100%"
                @select="handleSelect"
              >
                <i slot="suffix" class="el-icon-edit el-input__icon" />
                <template slot-scope="{ item }">
                  <div class="value">{{ item.name }}</div>
                </template>
              </el-autocomplete>
            </el-form-item>
            <el-form-item label="Hotel Category">
              <el-select
                v-model="formTour.hotel_category"
                multiple
                placeholder="Select"
              >
                <el-option
                  v-for="item in formTour.options"
                  :key="item.id"
                  :label="item.categoryName"
                  :value="item.id"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <div v-else-if="active == 1">
          <el-form
            ref="dataForm2"
            :rules="rules"
            :model="temp"
            label-position="top"
            label-width="120px"
          >
            <el-form-item label="Start Day">
              <el-date-picker
                v-model="start_date"
                type="date"
                placeholder="Pick a day"
                @change="calculateDays"
              />
            </el-form-item>
          </el-form>
          <el-collapse v-model="activeNames" accordion>
            <div v-for="(formDay, counter) in formDayDetail" :key="counter">
              <div class="grid-content">
                <el-collapse-item
                  :title="formDay.dayName + formDay.startDate"
                  :name="counter"
                >
                  <el-form
                    ref="dataForm"
                    :rules="rules"
                    :model="temp"
                    label-position="top"
                    label-width="120px"
                  >
                    <div>
                      <el-form-item label="City">
                        <el-autocomplete
                          v-model="formDay.city_name"
                          popper-class="my-autocomplete"
                          :fetch-suggestions="getCities"
                          placeholder="Please input"
                          style="width: 100%"
                          @select="handleSelectCity"
                          @focus="arrayPosition = counter"
                        >
                          <i
                            slot="suffix"
                            class="el-icon-edit el-input__icon"
                          />
                          <template slot-scope="{ item }">
                            <div class="value">{{ item.nameEnglish }}</div>
                          </template>
                        </el-autocomplete>
                      </el-form-item>
                      <el-form-item label="">
                        <el-switch
                          v-model="formDay.match_day"
                          active-text="Enable for match"
                          inactive-text=""
                        >
                        </el-switch>
                      </el-form-item>
                      <el-form-item label="Image">
                        <el-upload
                          :action="url + 'TourMediaContent/SendTourImage'"
                          list-type="picture-card"
                          :on-preview="handlePictureCardPreview"
                          :on-remove="handleRemove"
                          name="UploadImage"
                          :data="formImageTour"
                        >
                          <i class="el-icon-plus" />
                        </el-upload>
                        <el-dialog :visible.sync="dialogVisible">
                          <img width="100%" :src="dialogImageUrl" alt="" />
                        </el-dialog>
                      </el-form-item>
                      <el-form-item label="Description">
                        <el-radio-group v-model="formDay.description_language">
                          <el-radio label="English" />
                          <el-radio label="Spanish" />
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item
                        v-if="formDay.description_language == 'English'"
                      >
                        <el-input
                          v-model="formDay.description_english"
                          type="textarea"
                          placeholder="Please input"
                        />
                      </el-form-item>
                      <el-form-item
                        v-if="formDay.description_language == 'Spanish'"
                      >
                        <el-input
                          v-model="formDay.description_spanish"
                          type="textarea"
                          placeholder="Please input"
                        />
                      </el-form-item></div
                  ></el-form>
                </el-collapse-item>
              </div>
            </div>
          </el-collapse>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> Cancel </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? postTour() : updateData()"
        >
          {{ active != 1 ? $t("table.next") : $t("table.confirm") }}
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
          {{ $t("table.confirm") }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { fetchList, fetchPv } from "@/api/article";
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
  name: "ConfigTour",
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
    return {
      tableKey: 0,
      list: null,
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
      downloadLoading: false,
      /** formDayDetail */
      formTour: {
        name: "",
        duration_in_days: 0,
        status: true,
        idProvider: 0,
        providerName: "",
        hotel_category: "",
        options: [],
      },
      idTourCreated: 0,
      formDayDetail: [],
      getDayDescription: [],
      arrayPosition: 0,
      tourUpdate: [],
      /* EndPoint */
      url: this.$store.getters.url,
      active: 0,
      dialogImageUrl: "",
      dialogVisible: false,
      activeNames: [0],
      start_date: "",
      formImageTour: {
        MediaContentType: 0,
        idTour: 0,
      },
      editTourDayDescription: false,
      editFormTourDayDescription: [],
      tourList: [],
    };
  },
  created() {
    /*     this.getList(); */
    this.getTour();
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
      this.getTour();
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
    resetTemp() {
      this.formTour = {
        name: "",
        duration_in_days: 0,
        status: true,
        idProvider: "",
        providerName: "",
        hotel_category: "",
        options: [],
      };
      this.formDayDetail = [];
    },
    handleFetchPv(pv) {
      fetchPv(pv).then((response) => {
        this.pvData = response.data.pvData;
        this.dialogPvVisible = true;
      });
    },
    handleDownload() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = ["id", "name", "idProvider", "duration_in_days"];
        const filterVal = ["id", "name", "idProvider", "duration_in_days"];
        const data = this.formatJson(filterVal);
        const date = new Date();
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "Tour" + date,
        });
        this.downloadLoading = false;
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
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.active = 0;
      this.editTourDayDescription = false;
    },
    postTour() {
      if (this.active == 0) {
        this.$refs["dataForm"].validate((valid) => {
          var tour = {
            name: this.formTour.name,
            duration_in_days: this.formTour.duration_in_days,
            status: this.formTour.status,
            idProvider: this.formTour.idProvider,
          };
          if (valid) {
            axios
              .post(this.url + "Tour", tour)
              .then((response) => {
                this.formImageTour.idTour = response.data.id;
                this.getDayDescription = response.data.tourDayDescriptions;
                this.getTour();
                this.postTourCategory();
                this.next();
              })
              .catch((error) => {
                console.error(error.response);
              });
          }
        });
      } else if (this.active == 1) {
        let waitresponse = false;
        this.formDayDetail.forEach((element, index) => {
          var dayDescription = {
            dayNumber: index + 1,
            dayDescription: element.description_language,
            start_time: element.startDate,
            tourId: this.formImageTour.idTour,
            id: this.getDayDescription[index].id,
          };
          axios
            .put(this.url + "Tour_Day_Description", dayDescription)
            .then((response) => {
              this.dialogFormVisible = false;
            })
            .catch((error) => {
              console.error(error.response);
            });
          console.log(this.formDayDetail);
        });
      }
    },
    postTourCategory() {
      console.log(this.formImageTour.idTour);
      this.formTour.options.forEach((option) => {
        var tourCategory = {
          tourId: this.formImageTour.idTour,
          hotelCategoryId: option.id,
        };
        axios
          .post(this.url + "TourCategory", tourCategory)
          .then((response) => {
            console.log(this.formTour.options);
          })
          .catch((error) => {
            console.error(error.response);
          });
      });
    },
    getTour() {
      this.listLoading = true;
      axios
        .get(this.url + "Tour")
        .then((response) => {
          console.log("sss", response.data);
          this.list = response.data;
          this.listLoading = false;
        })
        .catch((error) => {
          this.status = "error";
          console.log(error.response);
        });
    },
    handleDelete(row, selected) {
      var id = selected ? row : row.id;
      axios
        .delete(this.url + "Tour/" + id)
        .then((response) => {
          this.$notify({
            title: "Success",
            message: "Delete Successfully",
            type: "success",
            duration: 2000,
          });
          this.getTour();
          this.showReviewer = false;
          this.tourList = [];
        })
        .catch((error) => {
          console.error(error.response);
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
          this.$message({
            type: "success",
            message: "Delete completed",
          });
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
        this.tourList.push(arr.id);
      } else {
        this.removeItemFromArr(this.tourList, arr.id);
      }
      console.log(this.tourList);
    },
    removeItemFromArr(arr, item) {
      var i = arr.indexOf(item);

      if (i !== -1) {
        arr.splice(i, 1);
      }
    },
    handleDeleteAll() {
      /* delet duplicated id's */
      console.log(this.tourList);
      const clearList = [...new Set(this.tourList)];
      console.log(clearList);
      clearList.forEach((value) => {
        console.log(value);
        this.handleDelete(value, true);
      });
    },
    handleUpdate(row) {
      console.log(row);
      this.editFormTourDayDescription = [];
      this.active = 0;
      this.tourUpdate = row;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.formTour.name = row.name;
      this.formTour.duration_in_days = row.duration_in_days;
      this.formTour.status = row.status;
      this.formTour.idProvider = row.idProvider;
      this.formTour.providerName = row.providerName;
      this.editFormTourDayDescription = row.tourDayDescriptions;
      this.editTourDayDescription = true;
    },
    updateData() {
      if (this.active == 0) {
        this.$refs["dataForm"].validate((valid) => {
          var tour = {
            name: this.formTour.name,
            duration_in_days: this.formTour.duration_in_days,
            status: this.formTour.status,
            idProvider: this.formTour.idProvider,
            id: this.tourUpdate.id,
          };
          if (valid) {
            axios
              .put(this.url + "Tour", tour)
              .then((response) => {
                console.log("PUT")
                this.next();
                this.$notify({
                  title: "Success",
                  message: "Update Successfully",
                  type: "success",
                  duration: 2000,
                });
              })
              .catch((error) => {
                console.error(error.response);
              });
          }
        });
      } else if (this.active == 1) {
        if (this.active == 1) {
          let waitresponse = false;
          this.formDayDetail.forEach((element, index) => {
            var dayDescription = {
              dayNumber: index + 1,
              dayDescription: element.description_language,
              start_time: element.startDate,
              tourId: this.formImageTour.idTour,
              id: this.getDayDescription[index].id,
            };
            axios
              .put(this.url + "Tour_Day_Description", dayDescription)
              .then((response) => {
                console.log("PUT")
                this.dialogFormVisible = false;
              })
              .catch((error) => {
                console.error(error.response);
              });
            console.log(this.formDayDetail);
          });
        }
      }
    },
    getProviders(queryString, cb) {
      axios
        .get(this.url + "Provider")
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
          console.error(error.response);
        });
    },
    createFilter(queryString) {
      return (link) => {
        return link.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
      };
    },
    handleSelect(item) {
      this.formTour.providerName = item.name;
      this.formTour.idProvider = item.id;
      this.getCatProv(item.id);
    },
    handleSelectCity(item) {
      console.log(item, this.arrayPosition);
      this.formDayDetail[this.arrayPosition].city_name = item.nameEnglish;
      this.formDayDetail[this.arrayPosition].cityId = item.id;
    },
    handleIconClick(ev) {
      console.log(ev);
    },
    getCatProv(id) {
      axios
        .get(this.url + "hotel/GetCategoriesByProviderId?id=" + id)
        .then((response) => {
          this.formTour.options = response.data;
        })
        .catch((error) => {
          this.status = "error";
          console.log(error.response);
        });
    },
    changeStatus(data, status) {
      console.log(status);
      var tour = {
        id: data.id,
        name: data.name,
        duration_in_days: data.duration_in_days,
        status: status,
        idProvider: data.idProvider,
      };
      axios
        .put(this.url + "Tour", tour)
        .then((response) => {
          this.dialogFormVisible = false;
          this.$notify({
            title: "Success",
            message: "Status changed Successfully",
            type: "success",
            duration: 2000,
          });
          this.getProvider();
        })
        .catch((error) => {
          console.error(error);
        });
    },
    next() {
      if (this.active++ > 2) this.active = 0;
    },
    /** Images */
    handleRemove(file, fileList) {
      console.log(file, fileList);
      var tour = {
        id: this.formImageTour.idTour,
      };
      axios
        .delete(this.url + "TourMediaImage/DeleteTourMedia", tour)
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
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg" || file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG) {
        this.$message.error("La imagen debe estar en formato JPG!");
      }
      if (!isLt2M) {
        this.$message.error("La imagen excede los 2MB!");
      }
      return isJPG && isLt2M;
    },
    handleChange(val) {
      console.log(val);
    },
    /** City */
    getCities(queryString, cb) {
      axios
        .get(this.url + "City")
        .then((response) => {
          console.log(response.data);
          var links = response.data;
          var results = queryString
            ? links.filter(this.createFilterCity(queryString))
            : links;
          cb(results);
        })
        .catch((error) => {
          this.status = "error";
          console.error(error.response);
        });
    },
    createFilterCity(queryString) {
      return (link) => {
        return (
          link.nameEnglish.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        );
      };
    },
    calculateDays(item) {
      console.log(this.start_date)
      this.formDayDetail = [];
      const dateFormat =
        this.start_date.getDate() +
        "/" +
        (this.start_date.getMonth() + 1) +
        "/" +
        this.start_date.getFullYear();
      for (
        let index = 0;
        index < parseInt(this.formTour.duration_in_days)-1;
        index++
      ) {
        console.log(dateFormat);
        if (!this.editTourDayDescription) {
          var day = {
            dayName: "Day " + (index + 1) + " - ",
            startDate: this.addDate(index, dateFormat),
            city_name: "",
            cityId: 0,
            description_language: "English",
            description_english: "",
            description_spanish: "",
            match_day: false,
          };
          this.formDayDetail.push(day);
        } else {
          /* this.start_date = this.editFormTourDayDescription[index].startTime; */
          console.log(this.editFormTourDayDescription, index );
          var day = {
            dayName: "Day " + (index + 1) + " - ",
            startDate: this.addDate(index, dateFormat),
            city_name: "",
            cityId: 0,
            description_language: "English",
            description_english:
              this.editFormTourDayDescription[index]['dayDescription'],
            description_spanish: "",
            match_day: false,
          };
          this.formDayDetail[index] = day;
        }
      }
    },
    addDate(d, fecha) {
      var Fecha = new Date();
      var sFecha =
        fecha ||
        Fecha.getDate() +
          "/" +
          (Fecha.getMonth() + 1) +
          "/" +
          Fecha.getFullYear();
      var sep = sFecha.indexOf("/") !== -1 ? "/" : "-";
      var aFecha = sFecha.split(sep);
      var fecha = aFecha[2] + "/" + aFecha[1] + "/" + aFecha[0];
      fecha = new Date(fecha);
      fecha.setDate(fecha.getDate() + parseInt(d));
      var anno = fecha.getFullYear();
      var mes = fecha.getMonth() + 1;
      var dia = fecha.getDate();
      mes = mes < 10 ? "0" + mes : mes;
      dia = dia < 10 ? "0" + dia : dia;
      var fechaFinal = dia + sep + mes + sep + anno;
      return fechaFinal;
    },
    handleClose(done) {
      this.$confirm("Are you sure to close this form?")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
  },
};
</script>
<style lang="scss">
.el-form-item {
  margin-bottom: 22px !important;
}
.el-step__head.is-process {
  color: #619b97;
  border-color: #619b97;
}
.el-step__head.is-success {
  color: #619b97;
  border-color: #619b97;
}

.el-dialog__body {
  padding: 30px 20px;
  color: #619b97;
  font-size: 14px;
  word-break: break-all;
}
.el-step__title.is-process {
  font-weight: bold;
  color: #619b97;
}
.el-step__line {
  position: absolute;
  border-color: inherit;
  background-color: #619b97;
}

@media (max-width: 600px) {
  .el-dialog {
    width: 100% !important;
  }
}
</style>
