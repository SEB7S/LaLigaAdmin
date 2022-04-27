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
      <el-input
        placeholder="Search"
        style="width: 200px"
        class="filter-item"
        v-model="search"
        @keyup.enter.native="handleFilter"
      />
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
        v-if="showReviewer && this.categoryProviderList.length > 0"
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
      :data="categoryHT"
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
        :label="$t('provider.categories')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.categoryName }}</span>
        </template>
      </el-table-column>
      <!--       <el-table-column
        :label="$t('provider.categories')"
        min-width="100px"
        align="center"
        :accordion="false"
      >
        <template slot-scope="{ row }">
          <el-tree
            :data="row.providerCategories"
            :props="defaultProps"
            @node-click="handleNodeClick"
          ></el-tree>
        </template>
      </el-table-column> -->
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
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="top"
        label-width="120px"
        style="margin-left: 50px"
      >
        <el-form-item :label="$t('provider.categories')" prop="categoryName">
          <el-input v-model="formCategory.categoryName" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t("table.cancel") }}
        </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? postCategory() : updateData()"
        >
          {{ $t("table.confirm") }}
        </el-button>
      </div>
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
const axiosInstance = axios.create({
  headers: {
    "Access-Control-Allow-Origin": "*"
  }
});

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name;
  return acc;
}, {});

export default {
  name: "categoryProvider",
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
      defaultProps: {
        children: "hotels",
        label: "providerName",
      },
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
      search: "",
      textMap: {
        update: "Edit",
        create: "Create",
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
/*         categoryName: [
          {
            required: true,
            message: "Please input category",
            trigger: "change",
          },
        ], */

      },
      downloadLoading: false,
      /** FormCity  */
      city_name: "",
      city_nameEs: "",
      cities: [],
      /** FormStadium */
      formCategory: {
        categoryName: "",
      },
      hotelUpdate: [],
      categoryProviderList: [],
      /* EndPoint */
      url: this.$store.getters.url,
    };
  },
  created() {
    this.getCategoryHappyTour();
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
      this.getCategoryHappyTour();
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
      /** FormStadium */
      this.formCategory = {
        categoryName: "",
      };
    },
    handleUpdate(row) {
      console.log(row);
      this.hotelUpdate = row;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.formCategory.categoryName = row.categoryName;
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          var category = {
            id: this.hotelUpdate.id,
            categoryName: this.formCategory.categoryName,
          };
          axios
            .put(this.url + "HappyTourCategories", category)
            .then((response) => {
              this.dialogFormVisible = false;
              this.$notify({
                title: "Success",
                message: "Update Successfully",
                type: "success",
                duration: 2000,
              });

              this.getCategoryHappyTour();
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
        const tHeader = ["id", "categoryName"];
        const filterVal = ["id", "categoryName"];
        const data = this.formatJson(filterVal);
        const date = new Date();
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "CategoryHT" + date,
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
    postCategory() {
      this.$refs["dataForm"].validate((valid) => {
        var category = {
          categoryName: this.formCategory.categoryName,
        };
        if (valid) {
          axios
            .post(this.url + "HappyTourCategories", category)
            .then((response) => {
              this.dialogFormVisible = false;
              this.$notify({
                title: "Success",
                message: "Hotel Agregado con éxito",
                type: "success",
                duration: 2000,
              });
              this.getCategoryHappyTour();
            })
            .catch((error) => {
              console.error(error.response);
            });
        }
      });
    },
    getCategoryHappyTour() {
      this.listLoading = true;
      axios
        .get(this.url + "HappyTourCategories")
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
        .delete(this.url + "HappyTourCategories/" + id)
        .then((response) => {
          console.log(response);
          this.$notify({
            title: "Success",
            message: "Delete Successfully",
            type: "success",
            duration: 2000,
          });
          this.getCategoryHappyTour();
          this.showReviewer = false;
          this.categoryProviderList = [];
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
        this.categoryProviderList.push(arr.id);
      } else {
        this.removeItemFromArr(this.categoryProviderList, arr.id);
      }
      console.log(this.categoryProviderList);
    },
    removeItemFromArr(arr, item) {
      var i = arr.indexOf(item);

      if (i !== -1) {
        arr.splice(i, 1);
      }
    },
    handleDeleteAll() {
      /* delet duplicated id's */
      console.log(this.categoryProviderList);
      const clearList = [...new Set(this.categoryProviderList)];
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
      this.formCategory.city_name = item.nameEnglish;
      this.formCategory.cityId = item.id;
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
    handleSelectProvider(item) {
      this.formCategory.providerName = item.name;
      this.formCategory.providerId = item.id;
    },
    handleClose(done) {
      this.$confirm("Are you sure to close this form?")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
  },
  computed: {
    categoryHT() {
      if (this.list) {
        return this.list.filter((item) => {
          return item.categoryName
            .toLowerCase()
            .includes(this.search.toLowerCase());
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
