<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        placeholder="Nombre En"
        style="width: 200px"
        class="filter-item"
        v-model="search"
        @keyup.enter.native="handleFilter"
      />
      <!-- 
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
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="city"
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
        :label="$t('city.nameEnCity')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.nameEnglish }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('city.nameEsCity')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.nameEspanish }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('city.latitudeCity')" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.latitude }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('city.longitudeCity')" align="center">
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
        ref="formCity"
        :model="formCity"
        :rules="rules"
        label-position="top"
        label-width="70px"
        style="margin-left: 50px"
      >
        <el-form-item :label="$t('city.nameEnCity')" prop="city_name">
          <el-autocomplete
            v-model="formCity.city_name"
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
              <div class="value">{{ item.city }}, {{ item.country }}</div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item v-if="dialogStatus == 'update'">
          <span class="demo-input-label">{{ $t("city.nameEsCity") }}</span>
          <el-input v-model="formCity.city_nameEs" placeholder="Please input" />
        </el-form-item>
        <el-form-item>
          <span style="margin-right: 5px">Duplicar Nombre en Español: </span>
          <el-switch v-model="duplicateCity"> </el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t("table.cancel") }}
        </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? postCity() : updateData()"
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
          {{ $t("table.confirm") }}
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
  name: "ConfigCity",
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
      /** FormCity  */
      formCity: {
        city_name: "",
        city_nameEs: "",
      },
      duplicateCity: false,
      cityUpdate: [],
      cities: [],
      /* EndPoint */
      url: this.$store.getters.url,
      
      search: "",
      rules: {
        city_name: [
          {
            required: true,
            message: "Please input city",
            trigger: "change",
          },
        ],
      },
    };
  },
  created() {
    /*     this.getList(); */
    this.getCity();
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
      this.getCity();
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
      this.formCity = {
        city_name: "",
        city_nameEs: "",
      };
      this.duplicateCity = false;
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.formCity.city_name = "";
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024; // mock a id
          this.temp.author = "vue-element-admin";
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "Created Successfully",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handleUpdate(row) {
      console.log(row);
      this.cityUpdate = row;
      this.formCity.city_name = row.nameEnglish;
      this.formCity.city_nameEs = row.nameEspanish;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          var city = {
            id: this.cityUpdate.id,
            nameEnglish: this.cities.city + ", " + this.cities.country,
            nameEspanish: this.formCity.city_nameEs,
            latitude: this.cityUpdate.latitude,
            longitude: this.cityUpdate.longitude,
          };
          axios
            .put(this.url + "City", city)
            .then((response) => {
              this.dialogFormVisible = false;
              this.$notify({
                title: "Success",
                message: "Update Successfully",
                type: "success",
                duration: 2000,
              });

              this.getCity();
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
        const tHeader = [
          "id",
          "nameEnglish",
          "nameEspanish",
          "longitude",
          "latitude",
        ];
        const filterVal = [
          "id",
          "nameEnglish",
          "nameEspanish",
          "longitude",
          "latitude",
        ];
        const data = this.formatJson(filterVal);
        const date = new Date();
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "Cities_" + date,
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
    getCities(queryString, cb) {
      var url =
        "http://geodb-free-service.wirefreethought.com/v1/geo/cities?limit=5&offset=0&namePrefix=";
      if (queryString.length > 2) {
        axios
          .get(url + queryString)
          .then((response) => {
            console.log(response.data["data"]);
            cb(response.data["data"]);
            console.log(
              response.data["data"][0].city,
              response.data["data"][0].region,
              response.data["data"][0].country
            );
            return response.data["data"];
          })
          .catch((error) => {
            this.status = "error";
          });
      }
    },
    handleSelect(item) {
      console.log(item);
      this.formCity.city_name = item.city + ", " + item.country;
      this.cities = item;
    },
    handleIconClick(ev) {
      console.log(ev);
    },
    postCity() {
      this.$refs["formCity"].validate((valid) => {
        var city = {
          cityNameEnglish: this.cities.city + ", " + this.cities.country,
          cityNameEspanish: "sin definir",
          latitude: this.cities.latitude.toString(),
          longitude: this.cities.longitude.toString(),
        };
        if (this.duplicateCity) {
          city.cityNameEspanish = this.cities.city + ", " + this.cities.country;
        }
        if (valid) {
          axios
            .post(this.url + "City", city)
            .then((response) => {
              this.dialogFormVisible = false;
              this.$notify({
                title: "Success",
                message: "Ciudad Agregada con éxito",
                type: "success",
                duration: 2000,
              });
              this.getCity();
            })
            .catch((error) => {
              console.error(error.response);
            });
        }
      });
    },
    getCity() {
      this.listLoading = true;
      axios
        .get(this.url + "City")
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
        .delete(this.url + "City/" + row.id)
        .then((response) => {
          this.$notify({
            title: "Success",
            message: "Delete Successfully",
            type: "success",
            duration: 2000,
          });
          this.getCity();
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
  },
  computed: {
    city() {
      if (this.list.length > 0) {
        return this.list.filter((item) => {
          return (
            item.nameEnglish
              .toLowerCase()
              .includes(this.search.toLowerCase()) ||
            item.nameEspanish
              .toLowerCase()
              .includes(this.search.toLowerCase()) ||
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
.my-autocomplete {
  li {
    line-height: normal;
    padding: 7px;

    .value {
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .link {
      font-size: 12px;
      color: #b4b4b4;
    }
  }
}

.el-autocomplete-suggestion {
  width: 300px !important;
}

@media (max-width: 600px) {
  .el-dialog {
    width: 100% !important;
  }
}
</style>
