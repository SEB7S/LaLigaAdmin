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
      :data="provider"
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
        :label="$t('match.matchName')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.matchName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('match.stadiumCategory')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.stadioCategoryNameEnglish }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('match.matchPrice')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.matchPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('match.paxType')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.paxTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('match.startDate')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.startDate }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('match.finalDate')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.finalDate }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('provider.statusProvier')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.available"
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
      <el-form
        ref="formMatchRate"
        :model="formMatchRate"
        label-position="top"
        label-width="120px"
        style="margin-left: 50px"
      >
        <el-form-item
          :label="$t('match.matchName') + ' - ' + formMatchRate.startMatch"
          prop="stadiumId"
        >
          <el-autocomplete
            v-model="formMatchRate.matchName"
            popper-class="my-autocomplete"
            :fetch-suggestions="getMatch"
            placeholder="Please input"
            style="width: 100%"
            @select="handleSelectMatch"
          >
            <i
              slot="suffix"
              class="el-icon-edit el-input__icon"
              @click="handleIconClickMatch"
            />
            <template slot-scope="{ item }">
              <div class="value">{{ item.clubs }}</div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item :label="$t('match.matchPrice')" prop="document">
          <el-input v-model="formMatchRate.match_price" />
        </el-form-item>
        <el-form-item :label="$t('match.paxType')" prop="phone">
          <el-select v-model="formMatchRate.paxTypeIn" placeholder="Select">
            <el-option
              v-for="item in paxTypeInOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('match.startDate')" prop="email">
          <el-date-picker
            v-model="formMatchRate.start_date"
            type="datetime"
            placeholder="Select date and time"
            :picker-options="pickerOptions"
            :default-value="defaultDate"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('match.finalDate')" prop="email">
          <el-date-picker
            v-model="formMatchRate.final_date"
            type="datetime"
            placeholder="Select date and time"
            :picker-options="pickerOptions"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('match.stadiumCategory')" prop="stadiumId">
          <el-autocomplete
            v-model="formMatchRate.stadiumCategoryName"
            popper-class="my-autocomplete"
            :fetch-suggestions="getCategoryStadium"
            placeholder="Please input"
            style="width: 100%"
            @select="handleSelectCatStad"
          >
            <i
              slot="suffix"
              class="el-icon-edit el-input__icon"
              @click="handleIconClickCatStad"
            />
            <template slot-scope="{ item }">
              <div class="value">{{ item.nameEnglish }}</div>
            </template>
          </el-autocomplete>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t("table.cancel") }}
        </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? postMatchRate() : updateData()"
        >
          {{ $t("table.confirm") }}
        </el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="dialogPvVisible"
      title="Reading statistics"
      :before-close="handleClose"
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
import { fetchList, fetchPv } from "@/api/article";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import axios from "axios";
import moment from "moment";
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

      /** FormMatchRate */
      formMatchRate: {
        matchId: "",
        matchName: "",
        start_date: "",
        final_date: "",
        stadiumCategoryId: 1,
        stadiumCategoryName: "",
        paxTypeIn: "",
        match_price: 0,
        stadium_id: 0,
        startMatch: "",
      },
      rules: {
        name: [
          {
            required: true,
            message: "Please input name",
            trigger: "blur",
          },
          {
            min: 3,
            message: "Length should be 3",
            trigger: "blur",
          },
        ],
        document: [
          {
            required: true,
            message: "Please input document",
            trigger: "blur",
          },
          {
            min: 3,
            message: "Length should be 3",
            trigger: "blur",
          },
        ],
        phone: [
          {
            required: true,
            message: "Please input longitude",
            trigger: "blur",
          },
          {
            min: 3,
            message: "Length should be 3",
            trigger: "blur",
          },
        ],
        email: [
          {
            required: true,
            message: "Please input city",
            trigger: "blur",
          },
          {
            type: "email",
            message: "Please input correct email address",
            trigger: ["blur", "change"],
          },
        ],
      },
      matchRateUpdate: [],
      /* EndPoint */
      url: this.$store.getters.url,
      search: "",
      stadiumList: [],
      defaultDate: new Date(),
      paxTypeInOption: [
        {
          value: 1,
          label: "Adult",
        },
        {
          value: 2,
          label: "Child",
        },
      ],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now();
        },
      },
    };
  },
  created() {
    /*     this.getList(); */
    this.getMatchRate();
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
    sss() {
      var esto = new Date();
      console.log(this.formMatchRate.start_date, esto);
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getMatchRate();
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
      this.formMatchRate = {
        matchId: "",
        matchName: "",
        start_date: "",
        final_date: "",
        stadiumCategoryId: 1,
        stadiumCategoryName: "",
        paxTypeIn: "",
        match_price: 0,
        startMatch: "",
      };
    },
    resetFormContinue() {
      console.log(this.formMatchRate);
      this.formMatchRate.match_price = "";
      this.formMatchRate.stadiumCategoryId = 0;
      this.formMatchRate.stadiumCategoryName = "";

      (this.stadiumCategoryId = 1), (this.stadiumCategoryName = "");
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
        const tHeader = ["id", "name", "document", "phone", "email"];
        const filterVal = ["id", "name", "document", "phone", "email"];
        const data = this.formatJson(filterVal);
        const date = new Date();
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "Providers" + date,
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
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.city_name = "";
      this.resetTemp();
    },
    postMatchRate() {
      this.$refs["formMatchRate"].validate((valid) => {
        var matchRate = {
          start_date: this.formMatchRate.start_date,
          final_date: this.formMatchRate.final_date,
          available: true,
          stadiumStadiumCategoryId: this.formMatchRate.stadiumCategoryId,
          matchId: this.formMatchRate.matchId,
          paxTypeIn: parseInt(this.formMatchRate.paxTypeIn),
          match_price: this.formMatchRate.match_price,
        };
        if (valid) {
          axios
            .post(this.url + "MatchRate", matchRate)
            .then((response) => {
              setTimeout(() => {
                this.$confirm(
                  "Match added, Do you want add other match?",
                  "Info",
                  {
                    confirmButtonText: "Yes",
                    cancelButtonText: "No",
                    type: "success",
                  }
                )
                  .then(() => {
                    this.resetFormContinue();
                  })
                  .catch(() => {
                    this.dialogFormVisible = false;
                  });
                this.getMatchRate();
              }, 1000);
            })
            .catch((error) => {
              console.error(error.response);
            });
        }
      });
    },
    getMatchRate() {
      this.listLoading = true;
      console.log(this.defaultDate);
      axios
        .get(this.url + "MatchRate")
        .then((response) => {
          console.log(response.data);
          this.list = response.data;
          this.listLoading = false;
        })
        .catch((error) => {
          this.status = "error";
        });
    },
    handleDelete(row, selected) {
      var id = selected ? row : row.id;
      axios
        .delete(this.url + "MatchRate/" + id)
        .then((response) => {
          this.$notify({
            title: "Success",
            message: "Delete Successfully",
            type: "success",
            duration: 2000,
          });
          this.getMatchRate();
          this.showReviewer = false;
          this.stadiumList = [];
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
          this.$message({
            type: "success",
            message: "Delete completed",
          });
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
    changeStatus(data, status) {
      this.$confirm(
        `Do you want to ${status ? "activate " : "inactivate"} this status?`,
        "Warning",
        {
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          type: "warning",
        }
      )
        .then(() => {
          console.log(data)
          var matchRate = {
            id: data.id,
            paxTypeIn: data.paxTypeId,
            stadiumStadiumCategoryId: data.stadiumCategoryId,
            match_price: data.matchPrice,
            start_date: data.startDate,
            final_date: data.finalDate,
            available: data.available,
            matchId: data.matchId,
          };
          axios
            .put(this.url + "MatchRate", matchRate)
            .then((response) => {
              this.dialogFormVisible = false;
              this.$notify({
                title: "Success",
                message: "Status changed Successfully",
                type: "success",
                duration: 2000,
              });

              this.getMatchRate();
            })
            .catch((error) => {
              console.error(error.response);
            });
        })
        .catch(() => {
          this.getMatchRate();
        });
    },
    handleUpdate(row) {
      console.log(row);
      this.matchRateUpdate = row;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.formMatchRate.matchId = row.matchId;
      
      /* this.formMatchRate.matchName = row.matchName; */
      this.formMatchRate.start_date = row.startDate;
      this.formMatchRate.final_date = row.finalDate;
      this.formMatchRate.stadiumCategoryId = row.stadiumCategoryId;
      this.formMatchRate.stadiumCategoryName = row.stadioCategoryNameEnglish;
      this.formMatchRate.paxTypeIn = row.paxTypeId;
      this.formMatchRate.matchName = row.matchName;
      this.formMatchRate.match_price = row.matchPrice;
      this.formMatchRate.stadium_id = row.stadioId
    },
    updateData() {
      this.$refs["formMatchRate"].validate((valid) => {
        if (valid) {
          var matchRate = {
            id: this.matchRateUpdate.id,
            paxTypeIn: this.formMatchRate.paxTypeIn,
            stadiumStadiumCategoryId: this.formMatchRate.stadiumCategoryId,
            match_price: this.formMatchRate.match_price,
            start_date: this.formMatchRate.start_date,
            final_date: this.formMatchRate.final_date,
            available: this.formMatchRate.available,
            matchId: this.formMatchRate.matchId,
          };
          axios
            .put(this.url + "MatchRate", matchRate)
            .then((response) => {
              this.dialogFormVisible = false;
              this.$notify({
                title: "Success",
                message: "Update Successfully",
                type: "success",
                duration: 2000,
              });

              this.getMatchRate();
            })
            .catch((error) => {
              console.error(error.response);
            });
        }
      });
    },
    handleClose(done) {
      this.$confirm("Are you sure to close this form?")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
    getCategoryStadium(queryString, cb) {
      axios
        .get(
          this.url +
            "Stadium/GetStadiumById?id=" +
            this.formMatchRate.stadium_id
        )
        .then((response) => {
          console.log(response.data);
          var links = response.data[0].stadiumCategories;
          var results = queryString
            ? links.filter(this.createFilterCatStad(queryString))
            : links;
          cb(results);
        })
        .catch((error) => {
          this.status = "error";
        });
    },
    createFilterCatStad(queryString) {
      return (link) => {
        return (
          link.nameEnglish.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        );
      };
    },
    handleSelectCatStad(item) {
      console.log(item);
      this.formMatchRate.stadiumCategoryName = item.nameEnglish;
      this.formMatchRate.stadiumCategoryId = item.id;
    },
    handleIconClickCatStad(ev) {
      console.log(ev);
    },
    getMatch(queryString, cb) {
      axios
        .get(this.url + "Match")
        .then((response) => {
          console.log(response.data);
          var links = response.data;
          var results = queryString
            ? links.filter(this.createFilterMatch(queryString))
            : links;
          cb(results);
        })
        .catch((error) => {
          this.status = "error";
        });
    },
    createFilterMatch(queryString) {
      return (link) => {
        return (
          link.clubs.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        );
      };
    },
    handleSelectMatch(item) {
      console.log(item);
      this.formMatchRate.matchId = item.id;
      this.formMatchRate.matchName = item.clubs;
      this.formMatchRate.stadium_id = item.stadium_id;
      this.formMatchRate.start_date = new Date();
      this.formMatchRate.final_date = new Date(item.date);
      this.formMatchRate.startMatch = new Date(item.date);
      if (
        this.formMatchRate.final_date.getTime() -
          this.formMatchRate.start_date.getTime() >=
        0
      ) {
        this.formMatchRate.final_date.setDate(
          this.formMatchRate.final_date.getDate() - 7
        );
      } else {
        this.formMatchRate.final_date = new Date(item.date);
      }
    },
    handleIconClickMatch(ev) {
      console.log(ev);
    },
  },
  computed: {
    provider() {
      if (this.list.length > 0) {
        return this.list.filter((item) => {
          return (
            /*             item.name.toLowerCase().includes(this.search.toLowerCase()) ||
            item.document.toLowerCase().includes(this.search.toLowerCase()) ||
            item.phone.toLowerCase().includes(this.search.toLowerCase()) ||
            item.email.toLowerCase().includes(this.search.toLowerCase()) */
            item
          );
        });
      }
    },
  },
  filters: {
    dateformat: function (value) {
      if (value) {
        return moment(String(value)).format("MM/DD/YYYY hh:mm");
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