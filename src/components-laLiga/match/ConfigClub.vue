<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="search"
        placeholder="Search"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      /><!--
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
        v-if="showReviewer && this.clubList.length > 0"
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
      :data="provider"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        v-if="showReviewer"
        type="selection"
        width="55"
        align="center"
      />
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
        :label="$t('match.nameClub')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('match.stadiumClub')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.stadiumName }}</span>
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
            icon="el-icon-edit"
            @click="handleUpdate(row)"
          />
          <el-button
            v-if="row.status != 'deleted'"
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="confirmDelete(row)"
          />
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
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-steps :active="active" align-center finish-status="success">
        <el-step title="General Data" />
        <el-step title="Update Images" />
      </el-steps>

      <div v-if="active == 0">
        <el-form
          ref="formClub"
          :model="formClub"
          :rules="rules"
          label-position="top"
          label-width="120px"
        >
          <el-form-item :label="$t('match.nameClub')" prop="clubName">
            <el-input v-model="formClub.clubName" />
          </el-form-item>
          <el-form-item :label="$t('match.stadiumClub')" prop="stadiumName">
            <el-autocomplete
              v-model="formClub.stadiumName"
              popper-class="my-autocomplete"
              :fetch-suggestions="getStadium"
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
                <div class="value">{{ item.name }}</div>
              </template>
            </el-autocomplete>
          </el-form-item>
        </el-form>
      </div>
      <div v-if="active == 1">
        <el-form
          ref="formClub"
          label-position="top"
          label-width="120px"
          style="margin: 30px"
        >
          <el-form-item :label="$t('stadium.image')">
            <el-upload
              :action="url + 'ClubMediaContent/SendClubImage'"
              list-type="picture-card"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
              :file-list="fileList"
              name="UploadImage"
              :data="formImageClub"
              :on-success="handleSuccess"
            >
              <i class="el-icon-plus" />
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
          @click="dialogStatus === 'create' ? postClub() : updateData()"
        >
          {{ $t("table.confirm") }}
        </el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="dialogPvVisible"
      title="Reading statistics"
      :close-on-click-modal="false"
    >
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
import i18n from "@/lang/index.js";
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
  name: "ConfigProvider",
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
      /** FormStadium */
      formClub: {
        clubName: "",
        stadiumId: 0,
        stadiumName: "",
      },
      rules: {
        clubName: [
          {
            required: true,
            message: i18n.t("forms.incompleteInput"),
          },
          {
            min: 3,
            message: i18n.t("forms.incompleteInputLength"),
          },
        ],
      },
      clubUpdate: [],
      /* EndPoint */
      url: this.$store.getters.url,
      search: "",
      clubList: [],
      active: 0,
      dialogImageUrl: "",
      dialogVisible: false,
      fileList: [],
      formImageClub: {
        MediaContentType: 0,
        idClub: 0,
        id: null,
      },
    };
  },
  /* INPUT SEARCH */
  computed: {
    provider() {
      if (this.list.length > 0) {
        return this.list.filter((item) => {
          return (
            item.name.toLowerCase().includes(this.search.toLowerCase()) ||
            item.document.toLowerCase().includes(this.search.toLowerCase()) ||
            item.phone.toLowerCase().includes(this.search.toLowerCase()) ||
            item.email.toLowerCase().includes(this.search.toLowerCase())
          );
        });
      }
    },
  },
  created() {
    /*     this.getList(); */
    this.getClub();
  },
  methods: {
    /* TABLE */
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
      this.getClub();
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
    handleDownload() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = ["id", "name", "stadiumId", "stadiumName"];
        const filterVal = ["id", "name", "stadiumId", "stadiumName"];
        const data = this.formatJson(filterVal);
        const date = new Date();
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "Clubs" + date,
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
      this.city_name = "";
      this.active = 0;
    },
    next() {
      if (this.active++ > 1) this.active = 0;
    },
    handleClose(done) {
      this.$confirm(i18n.t("modals.closeFormMsg"), i18n.t("modals.warning"))
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
    /* CLUB */
    resetTemp() {
      this.formClub = {
        name: "",
        stadiumId: 0,
        stadiumName: "",
      };
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    /* GET */
    getClub() {
      this.listLoading = true;
      axios
        .get(this.url + "Club")
        .then((response) => {
          console.log(response.data);
          this.list = response.data;
          this.listLoading = false;
        })
        .catch((error) => {
          this.status = "error";
        });
    },
    /* POST */
    postClub() {
      if (this.active == 0) {
        this.$refs["formClub"].validate((valid) => {
          var club = {
            clubName: this.formClub.clubName,
            stadiumId: this.formClub.stadiumId,
          };
          if (valid) {
            axios
              .post(this.url + "Club", club)
              .then((response) => {
                this.next();
                this.$notify({
                  title: i18n.t("notifications.success"),
                  message: i18n.t("notifications.clubAddedSuccessfully"),
                  type: "success",
                  duration: 2000,
                });

                this.formImageClub.idClub = response.data.id;
                this.getClub();
                this.resetForm("formClub");
                console.log(this.formImageClub.idClub, response);
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
    /* UPDATE */
    changeStatus(data, status) {
      this.$confirm(
        i18n.t("modals.deleteItemWarning"),
        i18n.t("modals.warning"),
        {
          confirmButtonText: i18n.t("modals.confirmButton"),
          cancelButtonText: i18n.t("modals.cancelButton"),
          type: "warning",
        }
      )
        .then(() => {
          this.$message({
            type: "success",
            message: i18n.t("modals.deleteComplete"),
          });
          var provider = {
            id: data.id,
            name: data.name,
            document: data.document,
            status: status,
            phone: data.phone,
            email: data.email,
          };
          axios
            .put(this.url + "Provider", provider)
            .then((response) => {
              this.dialogFormVisible = false;
              this.$notify({
                title: n18n.t("notifications.success"),
                message: n18n.t("notifications.changeStateSuccess"),
                type: "success",
                duration: 2000,
              });

              this.getClub();
            })
            .catch((error) => {
              console.error(error.response);
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: i18n.t("notifications.deleteCanceled"),
          });
          this.getClub();
        });
    },
    handleUpdate(row) {
      this.getImageByIdClub(row);
      console.log(row);
      this.clubUpdate = row;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.formClub.clubName = row.name;
      this.formClub.stadiumId = row.stadiumId;
      this.formClub.stadiumName = row.stadiumName;
      this.formImageClub.idClub = row.id;
      this.active = 0;
    },
    updateData() {
      if (this.active == 0) {
        this.$refs["formClub"].validate((valid) => {
          if (valid) {
            var provider = {
              id: this.clubUpdate.id,
              clubName: this.formClub.clubName,
              stadiumId: this.formClub.stadiumId,
            };
            axios
              .put(this.url + "Club", provider)
              .then((response) => {
                this.next();
                this.$notify({
                  title: i18n.t("notifications.success"),
                  message: i18n.t("notifications.updateSuccess"),
                  type: "success",
                  duration: 2000,
                });

                this.getClub();
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
    /* DELETE */
    handleSelectionChange(val) {
      this.clubList = val;
    },
    handleDelete(row, selected) {
      var id = selected ? row : row.id;
      axios
        .delete(this.url + "Club/" + id)
        .then((response) => {
          this.$notify({
            title: i18n.t("notifications.success"),
            message: i18n.t("notifications.deleteSuccessfully"),
            type: "success",
            duration: 2000,
          });
          this.getClub();
          this.showReviewer = false;
          this.clubList = [];
        })
        .catch((error) => {
          console.error(error.response);
        });
    },
    confirmDelete(row) {
      this.$confirm(
        i18n.t("modals.deleteItemWarning"),
        i18n.t("modals.warning"),
        {
          confirmButtonText: i18n.t("modals.confirmButton"),
          cancelButtonText: i18n.t("modals.cancelButton"),
          type: "warning",
        }
      )
        .then(() => {
          this.$message({
            type: "success",
            message: i18n.t("notifications.deleteComplete"),
          });
          this.handleDelete(row, false);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: i18n.t("notifications.deleteCanceled"),
          });
        });
    },
    handleDeleteAll() {
      this.$confirm(
        i18n.t("modals.deleteItemWarning"),
        i18n.t("modals.warning"),
        {
          confirmButtonText: i18n.t("modals.confirmButton"),
          cancelButtonText: i18n.t("modals.cancelButton"),
          type: "warning",
        }
      )
        .then(() => {
          this.$message({
            type: "success",
            message: i18n.t("notifications.deleteComplete"),
          });
          this.clubList.forEach((value) => {
            console.log(value);
            this.handleDelete(value, false);
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: i18n.t("notifications.deleteCanceled"),
          });
        });
    },
    /* STADIUM */
    getStadium(queryString, cb) {
      axios
        .get(this.url + "Stadium")
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
        return link.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
      };
    },
    handleSelect(item) {
      console.log(item);
      this.formClub.stadiumName = item.name;
      this.formClub.stadiumId = item.id;
    },
    handleIconClick(ev) {
      console.log(ev);
    },
    /* IMAGE */
    handleRemove(file, fileList) {
      console.log(file, fileList);
      axios
        .delete(this.url + "ClubMediaImage/DeleteClubMedia?id=" + file.id)
        .then((response) => {
          this.$notify({
            title: i18n.t("notifications.success"),
            message: i18n.t("notifications.deleteSuccessfully"),
            type: "success",
            duration: 2000,
          });
        })
        .catch((error) => {
          console.error(error.response);
        });
    },
    handleSuccess(response, file, fileList) {
      this.formImageClub.id = response.id;
      console.log(this.formImageClub.id, response);
    },
    handlePictureCardPreview(file) {
      console.log(file);
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    getImageByIdClub(club) {
      axios
        .get(this.url + "ClubMediaImage/GetAllByClub?idClub=" + club.id)
        .then((response) => {
          console.log(response.data);
          this.fileList = response.data;
        })
        .catch((error) => {
          this.status = "error";
        });
    },
  },
};
</script>
<style lang="scss">
</style>
