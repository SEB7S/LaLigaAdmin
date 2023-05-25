<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="search"
        placeholder="Search"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
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
      <!--       <el-button
        v-if="showReviewer"
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="danger"
        icon="el-icon-trash"
        @click="deleteAll"
      >
        {{ $t("table.deleteAll") }}
      </el-button> -->
      <el-button
        v-if="showReviewer && this.categoryStadiumList.length > 0"
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
        style="margin-left: 15px;"
        @change="tableKey = tableKey + 1"
      >
        {{ $t("table.select") }}
      </el-checkbox>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="stadiumCat"
      border
      fit
      highlight-current-row
      style="width: 100%;"
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
        :label="$t('stadium.nameEnglish')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.nameEnglish }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('stadium.nameEspanish')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.nameEspanish }}</span>
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
      :close-on-press-escape="false"
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formCategory"
        :rules="rules"
        :model="formCategory"
        label-position="top"
        label-width="120px"
      >
        <el-form-item :label="$t('stadium.nameEnglish')" prop="nameEnglish">
          <el-input v-model="formCategory.nameEnglish" />
        </el-form-item>
        <el-form-item :label="$t('stadium.nameEspanish')" prop="nameEspanish">
          <el-input v-model="formCategory.nameEspanish" />
        </el-form-item>
<!--         <el-form-item label="Categoy color" class="category-colors"  prop="category_color">
          <div class="block">
            <el-color-picker v-model="formCategory.categoryColor" :predefine="predefineColors"></el-color-picker>
          </div>
        </el-form-item> -->
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

    <el-dialog
      :close-on-press-escape="false"
      :visible.sync="dialogPvVisible"
      title="Reading statistics"
      :close-on-click-modal="false"
    >
      <el-table
        :data="pvData"
        border
        fit
        highlight-current-row
        style="width: 100%;"
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
import i18n from "@/lang/index.js";
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
  name: "CategoryProvider",
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
      search: "",
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
        nameEnglish: [
          {
            required: true,
            message: i18n.t("forms.nameIncomplete"),
          },
        ],
        nameEspanish: [
          {
            required: true,
            message: i18n.t("forms.nameIncomplete"),
          },
        ],
        category_color: [
          {
            required: true,
            message: i18n.t("forms.colorCategoryEmpty"),
            trigger: "blur",
          },
        ],
      },
      downloadLoading: false,
      /** FormStadium */
      formCategory: {
        nameEnglish: "",
        nameEspanish: "",
        categoryColor: ""
      },
      predefineColors: [
        '#9abee5',
        '#8ab1df',
        '#3471b6',
        '#1d4f8a',
        '#e73a5e',
      ],

      categoryStadiumList: [],
      /* EndPoint */
      url: this.$store.getters.url,
      multipleSelection: [],
    };
  },
  /* INPUT SEARCH */
  computed: {
    stadiumCat() {
      if (this.list) {
        return this.list.filter((item) => {
          return (
            item.nameEnglish
              .toLowerCase()
              .includes(this.search.toLowerCase()) ||
            item.nameEspanish.toLowerCase().includes(this.search.toLowerCase())
          );
        });
      }
    },
  },
  created() {
    this.getCategory();
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
      this.getCategory();
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
    /* Category */
    handleClose(done) {
      this.$confirm(i18n.t("modals.closeFormMsg"))
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
    handleDownload() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = ["id", "nameEnglish", "nameEspanish"];
        const filterVal = ["id", "nameEnglish", "nameEspanish"];
        const data = this.formatJson(filterVal);
        const date = new Date();
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "StadiumCategory" + date,
        });
        this.downloadLoading = false;
      });
    },
    resetTemp() {
      this.formCategory = {
        nameEnglish: "",
        nameEspanish: "",
      };
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    /* POST */
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
    },
    postCategory() {
      this.$refs["formCategory"].validate((valid) => {
        var category = {
          nameEnglish: this.formCategory.nameEnglish,
          nameEspanish: this.formCategory.nameEspanish,
        };
        if (valid) {
          axios
            .post(this.url + "StadiumCategory", category)
            .then((response) => {
              this.dialogFormVisible = false;
              this.$notify({
                title: i18n.t("notifications.success"),
                message: i18n.t("notifications.cathegoryAddedSuccess"),
                type: "success",
                duration: 2000,
              });
              this.getCategory();
              this.resetForm("formCategory");
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
      this.hotelUpdate = row;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.formCategory.nameEnglish = row.nameEnglish;
      this.formCategory.nameEspanish = row.nameEspanish;
      this.formCategory.priorityOrder = row.priorityOrder;
    },
    updateData() {
      this.$refs["formCategory"].validate((valid) => {
        if (valid) {
          var category = {
            id: this.hotelUpdate.id,
            nameEnglish: this.formCategory.nameEnglish,
            nameEspanish: this.formCategory.nameEspanish,
            priorityOrder: this.formCategory.priorityOrder,
          };
          axios
            .put(this.url + "StadiumCategory", category)
            .then((response) => {
              this.dialogFormVisible = false;
              this.$notify({
                title: i18n.t("notifications.success"),
                message: i18n.t("notifications.updateSuccess"),
                type: "success",
                duration: 2000,
              });

              this.getCategory();
            })
            .catch((error) => {
              console.error(error.response);
            });
        }
      });
    },

    /* GET */
    getCategory() {
      this.listLoading = true;
      axios
        .get(this.url + "StadiumCategory")
        .then((response) => {
          console.log(response.data);
          this.list = response.data;
          this.listLoading = false;
        })
        .catch((error) => {
          this.status = "error";
        });
    },
    /* DELETE */
    handleSelectionChange(val) {
      this.categoryStadiumList = val;
    },
    handleDelete(row, selected) {
      var id = selected ? row : row.id;
      axios
        .delete(this.url + "StadiumCategory/" + id)
        .then((response) => {
          this.$notify({
            title: i18n.t("notifications.success"),
            message: i18n.t("notifications.deleteSuccessfully"),
            type: "success",
            duration: 2000,
          });
          this.getCategory();
          this.showReviewer = false;
          this.categoryStadiumList = [];
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
          this.categoryStadiumList.forEach((value) => {
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
  },
};
</script>
<style lang="scss"></style>
