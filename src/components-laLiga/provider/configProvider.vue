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
        v-if="showReviewer && this.providerList.length > 0"
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
        :label="$t('provider.nameProvider')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('provider.taxIDProvider')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.document }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('provider.phoneProvider')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('provider.emailProvier')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('provider.statusProvier')"
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
            icon="el-icon-edit"
            @click="handleUpdate(row)"
          />
          <!--           <el-button
            v-if="row.status != 'deleted'"
            size="mini"
            type="danger"
            @click="confirmDelete(row)"
            icon="el-icon-delete"
          >
          </el-button> -->
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
        ref="formProvider"
        :model="formProvider"
        :rules="rules"
        label-position="top"
        label-width="120px"
      >
        <el-form-item :label="$t('provider.nameProvider')" prop="name">
          <el-input v-model="formProvider.name" />
        </el-form-item>
        <el-form-item :label="$t('provider.taxIDProvider')" prop="document">
          <el-input v-model="formProvider.document" />
        </el-form-item>
        <el-form-item :label="$t('provider.phoneProvider')" prop="phone">
          <el-input v-model="formProvider.phone" type="tel" />
        </el-form-item>
        <el-form-item :label="$t('provider.emailProvier')" prop="email">
          <el-input v-model="formProvider.email" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t("table.cancel") }}
        </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? postProvider() : updateData()"
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
      defaultProps: {
        children: "hotels",
        label: "name",
      },
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
      formProvider: {
        name: "",
        document: "",
        status: true,
        phone: "",
        email: "",
      },
      rules: {
        name: [
          {
            required: true,
            message: i18n.t("forms.nameIncomplete"),

          },
          {
            min: 3,
            message: i18n.t("forms.incompleteInputLength"),

          },
        ],
        document: [
          {
            required: false,
            message: "Please input document",

          },
          {
            min: 3,
            message: "Length should be 3",

          },
        ],
        phone: [
          {
            required: true,
            message: i18n.t("forms.incompleteInputLength"),

          },
          {
            min: 3,
            message: i18n.t("forms.incompleteInputLength"),

          },
        ],
        email: [
          {
            required: true,
            message: i18n.t("forms.cityIncomplete"),
            trigger: "blur",
          },
          {
            type: "email",
            message: i18n.t("forms.emailFormatIncorrect"),
            trigger: ["blur", "change"],
          },
        ],
      },
      providerUpdate: [],
      /* EndPoint */
      url: this.$store.getters.url,
      search: "",
      providerList: [],
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
    this.getProvider();
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
      this.getProvider();
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
    handleDownload() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = ["id", "name", "document", "phone", "email", "status"];
        const filterVal = ["id", "name", "document", "phone", "email", "status"];
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
    handleClose(done) {
      this.$confirm(i18n, t("modals.closeFormMsg"))
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
    handleNodeClick(data) {
      console.log(data);
    },
    /* PROVIDER */
    resetTemp() {
      this.formProvider = {
        name: "",
        document: "",
        status: true,
        phone: "",
        email: "",
      };
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    /* GET */
    getProvider() {
      this.listLoading = true;
      axios
        .get(this.url + "Provider")
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
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.city_name = "";
    },
    postProvider() {
      this.$refs["formProvider"].validate((valid) => {
        var provider = {
          name: this.formProvider.name,
          document: this.formProvider.document,
          status: this.formProvider.status,
          phone: this.formProvider.phone,
          email: this.formProvider.email,
        };
        if (valid) {
          axios
            .post(this.url + "Provider", provider)
            .then((response) => {
              this.dialogFormVisible = false;
              this.$notify({
                title: i18n.t("notifications.success"),
                message: i18n.t("notifications.providerAddedSuccessfully"),
                type: "success",
                duration: 2000,
              });
              this.getProvider();
              this.resetForm("formProvider")
            })
            .catch((error) => {
              console.error(error.response);
            });
        }
      });
    },
    /* UPDATE */
    changeStatus(data, status) {
      this.$confirm(
        i18n.t("modals.changeStatus", {
          mgs: status ? i18n.t("modals.activate") : i18n.t("modals.inactivate"),
        }),
        i18n.t("modals.warning"),
        {
          confirmButtonText: i18n.t("modals.confirmButton"),
          cancelButtonText: i18n.t("modals.cancelButton"),
          type: "warning",
        }
      )
        .then(() => {
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
                title: i18n("notifications.success"),
                message: i18n("notifications.changeStateSuccess"),
                type: "success",
                duration: 2000,
              });

              this.getProvider();
            })
            .catch((error) => {
              console.error(error.response);
            });
        })
        .catch(() => {
          this.getProvider();
        });
    },
    handleUpdate(row) {
      console.log(row);
      this.providerUpdate = row;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.formProvider.name = row.name;
      this.formProvider.document = row.document;
      this.formProvider.status = row.status;
      this.formProvider.phone = row.phone;
      this.formProvider.email = row.email;
    },
    updateData() {
      this.$refs["formProvider"].validate((valid) => {
        if (valid) {
          var provider = {
            id: this.providerUpdate.id,
            name: this.formProvider.name,
            document: this.formProvider.document,
            status: this.formProvider.status,
            phone: this.formProvider.phone,
            email: this.formProvider.email,
          };
          axios
            .put(this.url + "Provider", provider)
            .then((response) => {
              this.dialogFormVisible = false;
              this.$notify({
                title: i18n.t("notifications.success"),
                message: i18n.t("notifications.updateSuccess"),
                type: "success",
                duration: 2000,
              });

              this.getProvider();
            })
            .catch((error) => {
              console.error(error.response);
            });
        }
      });
    },
    /* DELETE */
    handleSelectionChange(val) {
      this.providerList = val;
    },
    handleDelete(row, selected) {
      var id = selected ? row : row.id;
      axios
        .delete(this.url + "Provider/" + id)
        .then((response) => {
          this.$notify({
            title: i18n("notifications.success"),
            message: i18n("notifications.deleteSuccessfully"),
            type: "success",
            duration: 2000,
          });
          this.getProvider();
          this.showReviewer = false;
          this.providerList = [];
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
            message: i18n("notifications.deleteComplete"),
          });
          this.handleDelete(row, false);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: i18n("notifications.deleteCanceled"),
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
            message: i18n("notifications.deleteComplete"),
          });
          this.providerList.forEach((value) => {
            console.log(value);
            this.handleDelete(value, false);
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: i18n("notifications.deleteCanceled"),
          });
        });
    },
  },
};
</script>
<style lang="scss">
</style>
