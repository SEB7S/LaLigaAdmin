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
        v-if="showReviewer && this.matchList.length > 0"
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
      >
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
        :label="$t('match.clubHome')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.clubHome }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('match.clubGuest')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.clubGuest }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('match.stadium')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.stadiumName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('match.tournamentName')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.tournamentName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('match.date')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.date | dateformat }}</span>
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
        ref="formMatch"
        :model="formMatch"
        :rules="rules"
        label-position="top"
        label-width="120px"
        style="margin-left: 50px"
      >
        <el-form-item :label="$t('match.clubHome')" prop="clubHomeName">
          <el-autocomplete
            v-model="formMatch.clubHomeName"
            popper-class="my-autocomplete"
            :fetch-suggestions="getClub"
            placeholder="Please input"
            style="width: 100%"
            @select="handleSelectHome"
          >
            <i
              slot="suffix"
              class="el-icon-edit el-input__icon"
              @click="handleIconClickHome"
            />
            <template slot-scope="{ item }">
              <div class="value">{{ item.name }}</div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item :label="$t('match.clubGuest')" prop="clubGuestName">
          <el-autocomplete
            v-model="formMatch.clubGuestName"
            popper-class="my-autocomplete"
            :fetch-suggestions="getClub"
            placeholder="Please input"
            style="width: 100%"
            @select="handleSelectGuest"
          >
            <i
              slot="suffix"
              class="el-icon-edit el-input__icon"
              @click="handleIconClickGuest"
            />
            <template slot-scope="{ item }">
              <div class="value">{{ item.name }}</div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item :label="$t('match.stadium')" prop="stadiumName">
          <el-autocomplete
            v-model="formMatch.stadiumName"
            popper-class="my-autocomplete"
            :fetch-suggestions="getStadium"
            placeholder="Please input"
            style="width: 100%"
            @select="handleSelectStadium"
          >
            <i
              slot="suffix"
              class="el-icon-edit el-input__icon"
              @click="handleIconClickStadium"
            />
            <template slot-scope="{ item }">
              <div class="value">{{ item.name }}</div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item :label="$t('match.tournamentName')" prop="tournamentName">
          <el-autocomplete
            v-model="formMatch.tournamentName"
            popper-class="my-autocomplete"
            :fetch-suggestions="getTournament"
            placeholder="Please input"
            style="width: 100%"
            @select="handleSelectTournament"
          >
            <i
              slot="suffix"
              class="el-icon-edit el-input__icon"
              @click="handleIconClickTournament"
            />
            <template slot-scope="{ item }">
              <div class="value">{{ item.name }}</div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item :label="$t('match.date')" prop="date">
          <el-date-picker
            v-model="formMatch.date"
            type="datetime"
            placeholder="Select date and time"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t("table.cancel") }}
        </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? postMatch() : updateData()"
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
      /** FormStadium */
      formMatch: {
        club_guest_id: 0,
        clubGuestName: "",
        club_home_id: 0,
        clubHomeName: "",
        stadium_id: 0,
        stadiumName: "",
        date: "",
        tournamentName: "",
        tournament_id: 0,
      },
      rules: {
        clubGuestName: [
          {
            required: true,
            message: "Please input text",
            trigger: "blur",
          },
        ],
        clubHomeName: [
          {
            required: true,
            message: "Please input text",
            trigger: "blur",
          },
        ],
        stadiumName: [
          {
            required: true,
            message: "Please input text",
            trigger: "blur",
          },
        ],
        date: [
          {
            required: true,
            message: "Please input text",
            trigger: "blur",
          },
        ],
        tournamentName: [
          {
            required: true,
            message: "Please input text",
            trigger: "blur",
          },
        ],
      },
      matchUpdate: [],
      /* EndPoint */
      url: this.$store.getters.url,
      search: "",
      matchList: [],
    };
  },
  created() {
    /*     this.getList(); */
    this.getMatch();
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
      this.getMatch();
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
    handleClose(done) {
      this.$confirm("Are you sure to close this form?")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
    /* MATCH */
    resetTemp() {
      this.formMatch = {
        club_guest_id: 0,
        clubGuestName: "",
        club_home_id: 0,
        clubHomeName: "",
        stadium_id: 0,
        stadiumName: "",
        date: "",
        tournamentName: "",
        tournament_id: 0,
      };
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.city_name = "";
    },
    /* GET */
    getMatch() {
      this.listLoading = true;
      axios
        .get(this.url + "Match")
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
    postMatch() {
      this.$refs["formMatch"].validate((valid) => {
        /* Extrayendo GMT de la fecha */
        let d = this.formMatch.date.toString();
        let e = d.split("GMT");
        let f = e[1].split(" ");
        let g = parseInt(f[0]);
        console.log(g);
        var match = {
          club_home_id: this.formMatch.club_home_id,
          club_guest_id: this.formMatch.club_guest_id,
          stadium_id: this.formMatch.stadium_id,
          date: this.formMatch.date,
          tournament_id: this.formMatch.tournament_id,
          timeZone: g,
        };
        if (valid) {
          axios
            .post(this.url + "Match", match)
            .then((response) => {
              this.dialogFormVisible = false;
              this.$notify({
                title: "Success",
                message: "Proveedor Agregado con éxito",
                type: "success",
                duration: 2000,
              });
              this.getMatch();
            })
            .catch((error) => {
              console.error(error.response);
            });
        }
      });
    },
    /* UPDATE */
    handleUpdate(row) {
      console.log(row);
      this.matchUpdate = row;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.formMatch.club_guest_id = row.club_guest_id;
      this.formMatch.clubGuestName = row.clubGuest;
      this.formMatch.club_home_id = row.club_home_id;
      this.formMatch.clubHomeName = row.clubHome;
      this.formMatch.stadium_id = row.stadium_id;
      this.formMatch.stadiumName = row.stadiumName;
      this.formMatch.tournamentName = row.tournamentName;
      this.formMatch.tournament_id = row.tournament_id;
      this.formMatch.date = new Date(row.date);
    },
    updateData() {
      this.$refs["formMatch"].validate((valid) => {
        if (valid) {
          console.log(this.formMatch.date);
          /* Extrayendo GMT de la fecha */
          let d = this.formMatch.date.toString();
          let e = d.split("GMT");
          let f = e[1].split(" ");
          let g = parseInt(f[0]);
          console.log(g);
          var match = {
            id: this.matchUpdate.id,
            club_guest_id: this.formMatch.club_guest_id,
            club_home_id: this.formMatch.club_home_id,
            stadium_id: this.formMatch.stadium_id,
            date: this.formMatch.date,
            tournament_id: this.formMatch.tournament_id,
            timeZone: g,
          };
          axios
            .put(this.url + "Match", match)
            .then((response) => {
              this.dialogFormVisible = false;
              this.$notify({
                title: "Success",
                message: "Update Successfully",
                type: "success",
                duration: 2000,
              });

              this.getMatch();
            })
            .catch((error) => {
              console.error(error.response);
            });
        }
      });
    },
    /* DELETE */
    handleSelectionChange(val) {
      this.matchList = val;
    },
    handleDelete(row, selected) {
      var id = selected ? row : row.id;
      axios
        .delete(this.url + "Match/" + id)
        .then((response) => {
          this.$notify({
            title: "Success",
            message: "Delete Successfully",
            type: "success",
            duration: 2000,
          });
          this.getMatch();
          this.showReviewer = false;
          this.matchList = [];
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
    handleDeleteAll() {
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
          this.matchList.forEach((value) => {
            console.log(value);
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
    /* CLUB */
    getClub(queryString, cb) {
      axios
        .get(this.url + "Club")
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
    handleSelectHome(item) {
      console.log(item);
      this.formMatch.clubHomeName = item.name;
      this.formMatch.club_home_id = item.id;
      this.formMatch.stadium_id = item.stadiumId;
      this.formMatch.stadiumName = item.stadiumName;
    },
    handleIconClickHome(ev) {
      console.log(ev);
    },
    handleSelectGuest(item) {
      console.log(item);
      this.formMatch.clubGuestName = item.name;
      this.formMatch.club_guest_id = item.id;
    },
    handleIconClickGuest(ev) {
      console.log(ev);
    },
    /* STADIUM */
    getStadium(queryString, cb) {
      axios
        .get(this.url + "Stadium")
        .then((response) => {
          console.log(response.data);
          var links = response.data;
          var results = queryString
            ? links.filter(this.createFilterStadium(queryString))
            : links;
          cb(results);
        })
        .catch((error) => {
          this.status = "error";
        });
    },
    createFilterStadium(queryString) {
      return (link) => {
        return link.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
      };
    },
    handleSelectStadium(item) {
      console.log(item);
      this.formMatch.stadiumName = item.name;
      this.formMatch.stadium_id = item.id;
    },
    handleIconClickStadium(ev) {
      console.log(ev);
    },
    /* TOURNAMENT */
    getTournament(queryString, cb) {
      axios
        .get(this.url + "Tournament")
        .then((response) => {
          console.log(response.data);
          var links = response.data;
          var results = queryString
            ? links.filter(this.createFilterTournament(queryString))
            : links;
          cb(results);
        })
        .catch((error) => {
          this.status = "error";
        });
    },
    createFilterTournament(queryString) {
      return (link) => {
        return link.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
      };
    },
    handleSelectTournament(item) {
      console.log(item);
      this.formMatch.tournamentName = item.name;
      this.formMatch.tournament_id = item.id;
    },
    handleIconClickTournament(ev) {
      console.log(ev);
    },
  },
  /* INPUR SEARCH */
  computed: {
    provider() {
      if (this.list.length > 0) {
        return this.list.filter((item) => {
          return (
            item.clubGuest.toLowerCase().includes(this.search.toLowerCase()) ||
            item.clubHome.toLowerCase().includes(this.search.toLowerCase()) ||
            item.tournamentName
              .toLowerCase()
              .includes(this.search.toLowerCase()) ||
            item.stadiumName.toLowerCase().includes(this.search.toLowerCase())
          );
        });
      }
    },
  },
  filters: {
    dateformat: function (value) {
      if (value) {
        return moment(String(value)).format("MM/DD/YYYY HH:mm");
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