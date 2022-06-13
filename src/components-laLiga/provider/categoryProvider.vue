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
        v-model="search"
        placeholder="Search"
        style="width: 200px"
        class="filter-item"
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
      :data="providerList"
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
        :label="$t('provider.categoryProvider')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('provider.categories')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.happyTourCategoryName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('provider.nameProvider')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.providerName }}</span>
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
      :close-on-click-modal = "false"
    >
      <el-form
        ref="formCategory"
        :rules="rules"
        :model="formCategory"
        label-position="top"
        label-width="120px"
      >
        <el-form-item
          :label="$t('provider.categoryProvider')"
          prop="categoryName"
        >
          <el-input v-model="formCategory.categoryName" />
        </el-form-item>
        <el-form-item :label="$t('provider.categories')" prop="HTCategoryName">
          <el-autocomplete
            v-model="formCategory.HTCategoryName"
            popper-class="my-autocomplete"
            :fetch-suggestions="getHTCategory"
            placeholder="Please input"
            style="width: 100%"
            @select="handleSelectHTCategory"
          >
            <i slot="suffix" class="el-icon-edit el-input__icon" />
            <template slot-scope="{ item }">
              <div class="value">{{ item.categoryName }}</div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item :label="$t('provider.nameProvider')" prop="providerName">
          <el-autocomplete
            v-model="formCategory.providerName"
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
          @click="dialogStatus === 'create' ? postCategory() : updateData()"
        >
          {{ $t("table.confirm") }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      :visible.sync="dialogPvVisible"
      title="Reading statistics"
      :close-on-click-modal = "false"
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
import {
  fetchList,
  fetchPv,
  createArticle,
  updateArticle
} from '@/api/article'
import i18n from '@/lang/index.js'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import axios from 'axios'
const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'CategoryProvider',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      search: '',
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [
        { label: 'ID Ascending', key: '+id' },
        { label: 'ID Descending', key: '-id' }
      ],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        categoryName: [
          {
            required: true,
            message: i18n.t('forms.categoryIncomplete'),
            trigger: 'blur'
          }
        ],
        providerName: [
          {
            required: true,
            message: i18n.t('forms.providerIncomplete'),
            trigger: 'blur'
          }
        ],
        HTCategoryName: [
          {
            required: true,
            message: i18n.t('forms.categoryHtIncomplete'),
            trigger: 'blur'
          }
        ]
      },
      downloadLoading: false,
      /** FormCity  */
      city_name: '',
      city_nameEs: '',
      cities: [],
      /** FormStadium */
      formCategory: {
        categoryName: '',
        providerId: '',
        providerName: '',
        HTCategoryId: '',
        HTCategoryName: ''
      },
      categoryUpdate: [],
      categoryProviderList: [],
      /* EndPoint */
      url: this.$store.getters.url
    }
  },
  /* INPUT SEARCH */
  computed: {
    providerList() {
      if (this.list) {
        return this.list.filter((item) => {
          return (
            item.name.toLowerCase().includes(this.search.toLowerCase()) ||
            item.happyTourCategoryName
              .toLowerCase()
              .includes(this.search.toLowerCase()) ||
            item.providerName.toLowerCase().includes(this.search.toLowerCase())
          )
        })
      }
    }
  },
  created() {
    this.getCategory()
  },
  methods: {
    /* TABLE */
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then((response) => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getCategory()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    handleFetchPv(pv) {
      fetchPv(pv).then((response) => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then((excel) => {
        const tHeader = ['id', 'name', 'Ciudad', 'longitude', 'latitude']
        const filterVal = ['id', 'name', 'cityId', 'longitude', 'latitude']
        const data = this.formatJson(filterVal)
        const date = new Date()
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'Stadiums' + date
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map((v) =>
        filterVal.map((j) => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        })
      )
    },
    getSortClass: function(key) {
      /*       const sort = this.listQuery.sort;
      return sort === `+${key}` ? "ascending" : "descending"; */
    },
    /* CATEGORY PROVIDERS */
    resetTemp() {
      this.formCategory = {
        categoryName: '',
        providerId: 0,
        providerName: '',
        HTCategoryName: '',
        HTCategoryId: 0
      }
    },
    validateDuplicateProv(providerId, happyTourCategoryId) {
      console.log(providerId, happyTourCategoryId)
      this.list.forEach((element) => {
        if (
          element.happyTourCategoryId == happyTourCategoryId &&
          element.providerId == providerId
        ) {
          console.log('cumple')
          return true
        }
      })
    },
    /* GET */
    getCategory() {
      this.listLoading = true
      axios
        .get(this.url + 'ProviderCategories')
        .then((response) => {
          console.log(response.data)
          this.list = response.data
          this.listLoading = false
        })
        .catch((error) => {
          this.status = 'error'
        })
    },
    /* POST */
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    postCategory() {
      this.$refs['formCategory'].validate((valid) => {
        let duplicate
        if (valid) {
          var category = {
            providerCategoryName: this.formCategory.categoryName,
            providerId: this.formCategory.providerId,
            happyTourCategoryId: this.formCategory.HTCategoryId
          }
          duplicate = this.list.findIndex(function(element) {
            return (
              element.happyTourCategoryId == category.happyTourCategoryId &&
              element.providerId == category.providerId
            )
          })
        }

        console.log(duplicate)
        if (duplicate == -1) {
          axios
            .post(this.url + 'ProviderCategories', category)
            .then((response) => {
              this.dialogFormVisible = false
              this.$notify({
                title: i18n('notifications.success'),
                message: i18n('notifications.hotelAddedSuccess'),
                type: 'success',
                duration: 2000
              })
              this.getCategory()
            })
            .catch((error) => {
              console.error(error.response)
            })
        } else {
          this.$notify({
            title: i18n('notifications.success'),
            message: i18n('notifications.providerDuplicated'),
            type: 'error',
            duration: 2000
          })
        }
      })
    },
    /* UPDATE */
    handleUpdate(row) {
      console.log(row)
      this.categoryUpdate = row
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.formCategory.categoryName = row.name
      this.formCategory.providerName = row.providerName
      this.formCategory.providerId = row.providerId
      this.formCategory.HTCategoryName = row.happyTourCategoryName
      this.formCategory.HTCategoryId = row.happyTourCategoryId
    },
    updateData() {
      this.$refs['formCategory'].validate((valid) => {
        if (valid) {
          var category = {
            id: this.categoryUpdate.id,
            providerCategoryName: this.formCategory.categoryName,
            providerId: this.formCategory.providerId,
            happyTourCategoryId: this.formCategory.HTCategoryId
          }
          axios
            .put(this.url + 'ProviderCategories', category)
            .then((response) => {
              this.dialogFormVisible = false
              this.$notify({
                title: i18n.t('notifications.success'),
                message: i18n.t('notifications.updateSuccess'),
                type: 'success',
                duration: 2000
              })

              this.getCategory()
            })
            .catch((error) => {
              console.error(error.response)
            })
        }
      })
    },
    /* DELETE */
    handleSelectionChange(val) {
      this.categoryProviderList = val
    },
    handleDelete(row, selected) {
      var id = selected ? row : row.id
      axios
        .delete(this.url + 'ProviderCategories/' + id)
        .then((response) => {
          this.$notify({
            title: i18n.t('notifications.success'),
            message: i18n.t('notifications.deleteSuccessfully'),
            type: 'success',
            duration: 2000
          })
          this.getCategory()
          this.showReviewer = false
          this.categoryProviderList = []
        })
        .catch((error) => {
          console.error(error.response)
        })
    },
    confirmDelete(row) {
      this.$confirm(
        i18n.t('modals.deleteItemWarning'),
        i18n.t('modals.warning'),
        {
          onfirmButtonText: i18n.t('modals.confirmButton'),
          cancelButtonText: i18n.t('modals.cancelButton'),
          type: 'warning'
        }
      )
        .then(() => {
          this.$message({
            type: 'success',
            message: i18n.t('notifications.deleteComplete')
          })
          this.handleDelete(row, false)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: i18n.t('notifications.deleteCanceled')
          })
        })
    },
    handleDeleteAll() {
      this.$confirm(
        i18n.t('modals.deleteItemWarning'),
        i18n.t('modals.warning'),
        {
          confirmButtonText: i18n.t('modals.confirmButton'),
          cancelButtonText: i18n.t('modals.cancelButton'),
          type: 'warning'
        }
      )
        .then(() => {
          this.$message({
            type: 'success',
            message: i18n.t('notifications.deleteComplete')
          })
          this.categoryProviderList.forEach((value) => {
            console.log(value)
            this.handleDelete(value, false)
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: i18n.t('notifications.deleteCanceled')
          })
        })
    },
    /* CITY */
    getCities(queryString, cb) {
      axios
        .get(this.url + 'City')
        .then((response) => {
          console.log(response.data)
          var links = response.data
          var results = queryString
            ? links.filter(this.createFilter(queryString))
            : links
          cb(results)
        })
        .catch((error) => {
          this.status = 'error'
        })
    },
    createFilter(queryString) {
      return (link) => {
        return (
          link.nameEnglish.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        )
      }
    },
    handleSelect(item) {
      console.log(item)
      this.formCategory.city_name = item.nameEnglish
      this.formCategory.cityId = item.id
    },
    handleIconClick(ev) {
      console.log(ev)
    },
    handleClose(done) {
      this.$confirm(i18n.t('modals.closeFormMsg'))
        .then((_) => {
          done()
        })
        .catch((_) => {})
    },
    /* PROVIDERS */
    getProviders(queryString, cb) {
      axios
        .get(this.url + 'Provider')
        .then((response) => {
          console.log(response.data)
          var links = response.data
          var results = queryString
            ? links.filter(this.createFilterProvider(queryString))
            : links
          cb(results)
        })
        .catch((error) => {
          this.status = 'error'
          console.error(error.response)
        })
    },
    createFilterProvider(queryString) {
      return (link) => {
        return link.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0
      }
    },
    handleSelectProvider(item) {
      this.formCategory.providerName = item.name
      this.formCategory.providerId = item.id
    },
    /*  CATEGORY PROVIDER */
    getHTCategory(queryString, cb) {
      axios
        .get(this.url + 'HappyTourCategories')
        .then((response) => {
          console.log(response.data)
          var links = response.data
          var results = queryString
            ? links.filter(this.createFilterHTCategory(queryString))
            : links
          cb(results)
        })
        .catch((error) => {
          this.status = 'error'
          console.error(error.response)
        })
    },
    createFilterHTCategory(queryString) {
      return (link) => {
        return (
          link.categoryName.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        )
      }
    },
    handleSelectHTCategory(item) {
      this.formCategory.HTCategoryName = item.categoryName
      this.formCategory.HTCategoryId = item.id
    }
  }
}
</script>
<style lang="scss">
</style>
