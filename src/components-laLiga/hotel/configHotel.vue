<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        placeholder="Buscar"
        style="width: 200px"
        class="filter-item"
        v-model="search"
        @keyup.enter.native="handleFilter"
      />
      <!--       <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        Search
      </el-button>  -->
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
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="hotel"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
    >
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
        :label="$t('hotel.nameEnHotel')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.nameEnglish }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('hotel.nameEsHotel')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.nameSpanish }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('hotel.categoryHotel')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.category }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('hotel.cityHotel')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.cityName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('hotel.providerHotel')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.providerName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('hotel.status')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.statusActive"
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
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t("table.edit") }}
          </el-button>
          <el-button
            v-if="row.status != 'deleted'"
            size="mini"
            type="danger"
            @click="confirmDelete(row)"
          >
            {{ $t("table.delete") }}
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
        style="width: 800px; margin-left: 50px"
      >
        <el-form-item :label="$t('hotel.nameEnHotel')">
          <el-input v-model="formHotel.nameEnglish" />
        </el-form-item>
        <el-form-item :label="$t('hotel.nameEsHotel')">
          <el-input v-model="formHotel.nameSpanish" />
        </el-form-item>
        <el-form-item :label="$t('hotel.categoryHotel')">
          <el-input v-model="formHotel.category" />
        </el-form-item>
        <el-form-item :label="$t('hotel.cityHotel')">
          <el-autocomplete
            v-model="formHotel.city_name"
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
        <el-form-item :label="$t('hotel.providerHotel')">
          <el-autocomplete
            v-model="formHotel.providerName"
            popper-class="my-autocomplete"
            :fetch-suggestions="getProviders"
            placeholder="Please input"
            style="width: 100%"
            @select="handleSelectProvider"
          >
            <i slot="suffix" class="el-icon-edit el-input__icon" />
            <template slot-scope="{ item }">
              <div class="value">{{ item.name }}</div>
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
          @click="dialogStatus === 'create' ? postHotel() : updateData()"
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
      /** FormCity  */
      city_name: "",
      city_nameEs: "",
      cities: [],
      /** FormStadium */
      formHotel: {
        nameEnglish: "",
        nameSpanish: "",
        category: "",
        cityId: "",
        city_name: "",
        providerId: "",
        providerName: "",
        statusActive: true,
      },
      hotelUpdate: [],
      /* EndPoint */
      url: this.$store.getters.url,
      search: "",
    };
  },
  created() {
    this.getHotel();
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
      this.getHotel();
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
      this.temp = {
        id: undefined,
        importance: 1,
        remark: "",
        timestamp: new Date(),
        title: "",
        status: "published",
        type: "",
      };
    },
    handleUpdate(row) {
      console.log(row);
      this.hotelUpdate = row;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.formHotel.nameEnglish = row.nameEnglish;
      this.formHotel.nameSpanish = row.nameSpanish;
      this.formHotel.category = row.category;
      this.formHotel.city_name = row.cityName;
      this.formHotel.providerName = row.providerName;
      this.formHotel.statusActive = row.statusActive;
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          var hotel = {
            id: this.hotelUpdate.id,
            cityId: this.formHotel.cityId,
            nameEnglish: this.formHotel.nameEnglish,
            nameSpanish: this.formHotel.nameSpanish,
            category: this.formHotel.category,
            providerId: this.formHotel.providerId,
            statusActive: this.formHotel.statusActive,
          };
          axios
            .put(this.url + "Hotel", hotel)
            .then((response) => {
              this.dialogFormVisible = false;
              this.$notify({
                title: "Success",
                message: "Update Successfully",
                type: "success",
                duration: 2000,
              });

              this.getHotel();
            })
            .catch((error) => {
              console.error(error.response);
            });
        }
      });
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
        const tHeader = ["id", "name", "Ciudad", "longitude", "latitude"];
        const filterVal = ["id", "name", "cityId", "longitude", "latitude"];
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
    },
    postHotel() {
      this.$refs["dataForm"].validate((valid) => {
        var hotel = {
          nameEnglish: this.formHotel.nameEnglish,
          nameSpanish: this.formHotel.nameSpanish,
          category: this.formHotel.category,
          cityId: this.formHotel.cityId,
          providerId: this.formHotel.providerId,
          statusActive: this.formHotel.statusActive,
        };
        if (valid) {
          axios
            .post(this.url + "Hotel", hotel)
            .then((response) => {
              this.dialogFormVisible = false;
              this.$notify({
                title: "Success",
                message: "Hotel Agregado con éxito",
                type: "success",
                duration: 2000,
              });
              this.getHotel();
            })
            .catch((error) => {
              console.error(error.response);
            });
        }
      });
    },
    getHotel() {
      this.listLoading = true;
      axios
        .get(this.url + "Hotel")
        .then((response) => {
          console.log(response.data);
          this.list = response.data;
          this.listLoading = false;
        })
        .catch((error) => {
          this.status = "error";
        });
    },
    handleDelete(row) {
      axios
        .delete(this.url + "Hotel/" + row.id)
        .then((response) => {
          this.$notify({
            title: "Success",
            message: "Delete Successfully",
            type: "success",
            duration: 2000,
          });
          this.getHotel();
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
          this.handleDelete(row);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "Delete canceled",
          });
        });
    },
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
      this.formHotel.city_name = item.nameEnglish;
      this.formHotel.cityId = item.id;
    },
    handleIconClick(ev) {
      console.log(ev);
    },
    getProviders(queryString, cb) {
      axios
        .get(this.url + "Provider")
        .then((response) => {
          console.log(response.data);
          var links = response.data;
          var results = queryString
            ? links.filter(this.createFilterProvider(queryString))
            : links;
          cb(results);
        })
        .catch((error) => {
          this.status = "error";
          console.error(error.response);
        });
    },
    createFilterProvider(queryString) {
      return (link) => {
        return link.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
      };
    },
    handleSelectProvider(item) {
      this.formHotel.providerName = item.name;
      this.formHotel.providerId = item.id;
    },
    changeStatus(data, status) {
      console.log(status);
      var hotel = {
        id: data.id,
        nameEnglish: data.nameEnglish,
        nameSpanish: data.nameSpanish,
        providerId: data.providerId,
        category: data.category,
        statusActive: status,
        cityId: data.cityId,
      };
      axios
        .put(this.url + "Hotel", hotel)
        .then((response) => {
          this.dialogFormVisible = false;
          this.$notify({
            title: "Success",
            message: "Status changed Successfully",
            type: "success",
            duration: 2000,
          });
          this.getHotel();
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
  computed: {
    hotel() {
      if (this.list) {
        return this.list.filter((item) => {
          return item.nameEnglish
            .toLowerCase()
            .includes(this.search.toLowerCase()) ||
            item.nameSpanish
            .toLowerCase()
            .includes(this.search.toLowerCase()) ||
            item.cityName
            .toLowerCase()
            .includes(this.search.toLowerCase()) ||
            item.providerName
            .toLowerCase()
            .includes(this.search.toLowerCase()) || 
            item.category
            .toLowerCase()
            .includes(this.search.toLowerCase());
        });
      }
    },
  },
};
</script>
<style lang="scss">
