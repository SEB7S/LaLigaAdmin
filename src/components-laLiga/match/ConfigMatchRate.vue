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
        v-if="showReviewer && this.matchRateList.length > 0"
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
          <span>{{ row.startDate | formatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('match.finalDate')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.finalDate | formatDate }}</span>
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
      :before-close="handleClose"
    >
      <el-form
        ref="formMatchRate"
        :model="formMatchRate"
        :rules="rules"
        label-position="top"
        label-width="120px"
      >
        <el-form-item
          :label="$t('match.matchName') + ' - ' + formMatchRate.startMatch"
          prop="matchName"
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
        <el-form-item :label="$t('match.matchPrice')" prop="match_price">
          <el-input v-model="formMatchRate.match_price" />
        </el-form-item>
        <el-form-item :label="$t('match.paxType')" prop="paxTypeIn">
          <el-select v-model="formMatchRate.paxTypeIn" placeholder="Select">
            <el-option
              v-for="item in paxTypeInOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('match.startDate')" prop="start_date">
          <el-date-picker
            v-model="formMatchRate.start_date"
            type="datetime"
            placeholder="Select date and time"
            :picker-options="pickerOptions"
            :default-value="defaultDate"
          />
        </el-form-item>
        <el-form-item :label="$t('match.finalDate')" prop="final_date">
          <el-date-picker
            v-model="formMatchRate.final_date"
            type="datetime"
            placeholder="Select date and time"
            :picker-options="pickerOptions"
          />
        </el-form-item>
        <el-form-item
          :label="$t('match.stadiumCategory')"
          prop="stadiumCategoryName"
        >
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
<!--         <el-form-item label="Categoy color" class="category-colors"  prop="category_color">
          <div class="block">
            <el-color-picker v-model="formMatchRate.categoryColor" :predefine="predefineColors"></el-color-picker>
          </div>
        </el-form-item> -->
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
import i18n from '@/lang/index.js'
import { fetchList, fetchPv } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import axios from 'axios'
import moment from 'moment'
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
  name: 'ConfigProvider',
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
  filters: {
    dateformat: function(value) {
      if (value) {
        return moment(String(value)).format('MM/DD/YYYY hh:mm')
      }
    }
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
      downloadLoading: false,

      /** FormMatchRate */
      formMatchRate: {
        matchId: '',
        matchName: '',
        start_date: '',
        final_date: '',
        stadiumCategoryId: 1,
        stadiumCategoryName: '',
        paxTypeIn: '',
        match_price: 0,
        stadium_id: 0,
        startMatch: '',
        categoryColor: ''
      },
      rules: {
        matchName: [
          {
            required: true,
            message: i18n.t('forms.incompleteInput'),
            trigger: 'blur'
          }
        ],
        start_date: [
          {
            required: true,
            message: i18n.t('forms.incompleteInput'),
            trigger: 'blur'
          }
        ],
        final_date: [
          {
            required: true,
            message: i18n.t('forms.incompleteInput'),
            trigger: 'blur'
          }
        ],
        stadiumCategoryName: [
          {
            required: true,
            message: i18n.t('forms.incompleteInput'),
            trigger: 'blur'
          }
        ],
        paxTypeIn: [
          {
            required: true,
            message: i18n.t('forms.incompleteInput'),
            trigger: 'blur'
          }
        ],
        match_price: [
          {
            required: true,
            message: i18n.t('forms.incompleteInput'),
            trigger: 'blur'
          }
        ],
/*         category_color:[
          {
            required: true,
            message: i18n.t('forms.colorCategoryEmpty'),
            trigger: 'blur'
          }
        ] */
      },
      matchRateUpdate: [],
      /* EndPoint */
      url: this.$store.getters.url,
      search: '',
      matchRateList: [],
      defaultDate: new Date(),
      paxTypeInOption: [
        {
          value: 1,
          label: 'Adult'
        },
        {
          value: 2,
          label: 'Child'
        }
      ],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        }
      },

      predefineColors: [
        '#9abee5',
        '#8ab1df',
        '#3471b6',
        '#1d4f8a',
        '#e73a5e',
      ],
    }
  },
  /* INPUT SEARCH */
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
          )
        })
      }
    }
  },
  created() {
    /*     this.getList(); */
    this.getMatchRate()
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
      this.getMatchRate()
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
        const tHeader = [
          "id",
          "matchId",
          "matchName",
          "stadiumCategoryId",
          "stadioCategoryNameEnglish",
          "stadioCategoryNameSpanish",
          "matchPrice",
          "paxTypeName",
          "startDate",
          "finalDate",
          "available"
        ]
        const filterVal = [
          "id",
          "matchId",
          "matchName",
          "stadiumCategoryId",
          "stadioCategoryNameEnglish",
          "stadioCategoryNameSpanish",
          "matchPrice",
          "paxTypeName",
          "startDate",
          "finalDate",
          "available"
        ]
        const data = this.formatJson(filterVal)
        const date = new Date()
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'MatchRate' + date
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
    handleClose(done) {
      this.$confirm(i18n.t('modals.closeFormMsg'))
        .then((_) => {
          done()
        })
        .catch((_) => {})
    },
    /* MATCH RATE */
    resetTemp() {
      this.formMatchRate = {
        matchId: '',
        matchName: '',
        start_date: '',
        final_date: '',
        stadiumCategoryId: 1,
        stadiumCategoryName: '',
        paxTypeIn: '',
        match_price: 0,
        startMatch: ''
      }
    },
    resetFormContinue() {
      console.log(this.formMatchRate)
      this.formMatchRate.match_price = ''
      this.formMatchRate.stadiumCategoryId = 0
      this.formMatchRate.stadiumCategoryName = '';

      (this.stadiumCategoryId = 1), (this.stadiumCategoryName = '')
    },
    /* GET */
    getMatchRate() {
      this.listLoading = true
      console.log(this.defaultDate)
      axios
        .get(this.url + 'MatchRate')
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
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.city_name = ''
      this.resetTemp()
    },
    postMatchRate() {
      this.$refs['formMatchRate'].validate((valid) => {
        var matchRate = {
          start_date: this.formMatchRate.start_date,
          final_date: this.formMatchRate.final_date,
          available: true,
          stadiumStadiumCategoryId: this.formMatchRate.stadiumCategoryId,
          matchId: this.formMatchRate.matchId,
          paxTypeIn: parseInt(this.formMatchRate.paxTypeIn),
          match_price: this.formMatchRate.match_price
        }
        if (valid) {
          axios
            .post(this.url + 'MatchRate', matchRate)
            .then((response) => {
              setTimeout(() => {
                this.$confirm(
                  i18n.t('modals.addAnotherMatch'),
                  'Info',
                  {
                    confirmButtonText: i18n.t('modals.confirmButton'),
                    cancelButtonText: i18n.t('modals.cancelButton'),
                    type: 'success'
                  }
                )
                  .then(() => {
                    this.resetFormContinue()
                  })
                  .catch(() => {
                    this.dialogFormVisible = false
                  })
                this.getMatchRate()
              }, 1000)
            })
            .catch((error) => {
              console.error(error.response)
            })
        }
      })
    },
    /* UPDATE */
    changeStatus(data, status) {
      this.$confirm(
        i18n.t('modals.changeStatus', {mgs : status ?  i18n.t('modals.activate') : i18n.t('modals.inactivate')}),
        i18n.t('modals.warning'),
        {
          confirmButtonText: i18n.t('modals.confirmButton'),
          cancelButtonText: i18n.t('modals.cancelButton'),
          type: 'warning'
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
            matchId: data.matchId
          }
          axios
            .put(this.url + 'MatchRate', matchRate)
            .then((response) => {
              this.dialogFormVisible = false
              this.$notify({
                title: i18n('notifications.success'),
                message: i18n('notifications.changeStateSuccess'),
                type: 'success',
                duration: 2000
              })

              this.getMatchRate()
            })
            .catch((error) => {
              console.error(error.response)
            })
        })
        .catch(() => {
          this.getMatchRate()
        })
    },
    handleUpdate(row) {
      console.log(row)
      this.matchRateUpdate = row
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.formMatchRate.matchId = row.matchId

      /* this.formMatchRate.matchName = row.matchName; */
      this.formMatchRate.start_date = row.startDate
      this.formMatchRate.final_date = row.finalDate
      this.formMatchRate.stadiumCategoryId = row.stadiumCategoryId
      this.formMatchRate.stadiumCategoryName = row.stadioCategoryNameEnglish
      this.formMatchRate.paxTypeIn = row.paxTypeId
      this.formMatchRate.matchName = row.matchName
      this.formMatchRate.match_price = row.matchPrice
      this.formMatchRate.stadium_id = row.stadioId
    },
    updateData() {
      this.$refs['formMatchRate'].validate((valid) => {
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
          }
          axios
            .put(this.url + 'MatchRate', matchRate)
            .then((response) => {
              this.dialogFormVisible = false
              this.$notify({
                title: i18n('notifications.success'),
                message: i18n('notifications.uptadeSuccess'),
                type: 'success',
                duration: 2000
              })

              this.getMatchRate()
            })
            .catch((error) => {
              console.error(error.response)
            })
        }
      })
    },
    /* DELETE */
    handleSelectionChange(val) {
      this.matchRateList = val
    },
    handleDelete(row, selected) {
      console.log(row,selected)
      var id = selected ? row : row.id
      axios
        .delete(this.url + 'MatchRate/' + id)
        .then((response) => {
          this.$notify({
            title: i18n.t("notifications.success"),
            message: i18n.t("notifications.deleteSuccessfully"),
            type: "success",
            duration: 2000,
          });
          this.getMatchRate()
          this.showReviewer = false
          this.matchRateList = []
        })
        .catch((error) => {
          console.error(error.response)
        })
    },
    confirmDelete(row) {
      console.log(row)
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
          this.handleDelete(row, false)
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
        i18n('modals.deleteItemWarning'),
        'Warning',
        {
          confirmButtonText: i18n('modals.confirmButton'),
          cancelButtonText: i18n('modals.cancelButton'),
          type: 'warning'
        }
      )
        .then(() => {
          this.$message({
            type: 'success',
            message: i18n('notifications.deleteComplete')
          })
          this.matchRateList.forEach((value) => {
            console.log(value)
            this.handleDelete(value, false)
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: i18n('notifications.deleteCanceled')
          })
        })
    },

    /* CATEGORY STADIUM */
    getCategoryStadium(queryString, cb) {
      axios
        .get(
          this.url +
            'Stadium/GetStadiumById?id=' +
            this.formMatchRate.stadium_id
        )
        .then((response) => {
          var links = response.data[0].stadiumCategories
          var results = queryString
            ? links.filter(this.createFilterCatStad(queryString))
            : links
          cb(results)
          
        })
        .catch((error) => {
          this.status = 'error'
        })
    },
    createFilterCatStad(queryString) {
      return (link) => {
        return (
          link.nameEnglish.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        )
      }
    },
    handleSelectCatStad(item) {
      console.log(item)
      this.formMatchRate.stadiumCategoryName = item.nameEnglish
      this.formMatchRate.stadiumCategoryId = item.id
    },
    handleIconClickCatStad(ev) {
      console.log(ev)
    },
    /* MATCH */
    getMatch(queryString, cb) {
      axios
        .get(this.url + 'Match')
        .then((response) => {
          console.log(response.data)
          var links = response.data
          var results = queryString
            ? links.filter(this.createFilterMatch(queryString))
            : links
          cb(results)
        })
        .catch((error) => {
          this.status = 'error'
        })
    },
    createFilterMatch(queryString) {
      return (link) => {
        return (
          link.clubs.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
      }
    },
    handleSelectMatch(item) {
      console.log(item)
      this.formMatchRate.matchId = item.id
      this.formMatchRate.matchName = item.clubs
      this.formMatchRate.stadium_id = item.stadium_id
      this.formMatchRate.start_date = new Date()
      this.formMatchRate.final_date = new Date(item.date)
      this.formMatchRate.startMatch = new Date(item.date)
      if (
        this.formMatchRate.final_date.getTime() -
          this.formMatchRate.start_date.getTime() >=
        0
      ) {
        this.formMatchRate.final_date.setDate(
          this.formMatchRate.final_date.getDate() - 7
        )
      } else {
        this.formMatchRate.final_date = new Date(item.date)
      }
    },
    handleIconClickMatch(ev) {
      console.log(ev)
    }
  },
}
</script>
<style lang="scss" scoped>
</style>
