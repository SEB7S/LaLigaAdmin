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
      <!--COMMENT-->
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
      <el-checkbox
        v-model="showReviewer"
        class="filter-item"
        style="margin-left: 15px"
        @change="tableKey = tableKey + 1"
      >
        reviewer
      </el-checkbox>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
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
      <el-table-column :label="$t('user.nameUser')" min-width="100px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('user.cityUser')" min-width="100px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.cityName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('user.latitudeUser')" min-width="100px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.latitude }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('user.longitudeUser')" min-width="100px" align="center">
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="top"
      >
        <el-form-item :label="$t('user.nameUser')">
          <el-input v-model="formStadium.name" />
        </el-form-item>
        <el-form-item :label="$t('user.latitudeUser')">
          <el-input v-model="formStadium.latitude" />
        </el-form-item>
        <el-form-item :label="$t('user.longitudeUser')" >
          <el-input v-model="formStadium.longitude" />
        </el-form-item>
        <el-form-item :label="$t('user.cityUser')">
          <el-autocomplete
            v-model="formStadium.city_name"
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> 
          {{ $t("table.cancel") }}
        </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? postStadium() : updateData()"
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
  name: 'ConfigUser',
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
        type: [
          { required: true, message: 'type is required', trigger: 'change' }
        ],
        timestamp: [
          {
            type: 'date',
            required: true,
            message: 'timestamp is required',
            trigger: 'change'
          }
        ],
        title: [
          { required: true, message: 'title is required', trigger: 'blur' }
        ]
      },
      downloadLoading: false,
      /** FormCity  */
      city_name: '',
      city_nameEs: '',
      cities: [],
      /** FormStadium */
      formStadium: {
        name: '',
        latitude: '',
        longitude: '',
        cityId: '',
        city_name: ''
      },
      stadiumUpdate: [],
      /* EndPoint */
      url: this.$store.getters.url
    }
  },
  created() {
    /*     this.getList(); */
    this.getStadium()
  },
  methods: {
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
      this.getStadium()
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
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleUpdate(row) {
      console.log(row)
      this.stadiumUpdate = row
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.formStadium.name = row.name
      this.formStadium.latitude = row.latitude
      this.formStadium.longitude = row.longitude
      this.formStadium.city_name = row.cityId
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          var stadium = {
            id: this.stadiumUpdate.id,
            cityId: this.formStadium.cityId,
            name: this.formStadium.name,
            latitude: this.formStadium.latitude,
            longitude: this.formStadium.longitude
          }
          axios
            .put(this.url + 'Stadium', stadium)
            .then((response) => {
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: 'Update Successfully',
                type: 'success',
                duration: 2000
              })

              this.getStadium()
            })
            .catch((error) => {
              console.error(error.response)
            })
        }
      })
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
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.city_name = ''
    },
    postStadium() {
      this.$refs['dataForm'].validate((valid) => {
        var stadium = {
          stadiumName: this.formStadium.name,
          latitude: this.formStadium.latitude,
          longitude: this.formStadium.longitude,
          cityId: this.formStadium.cityId
        }
        if (valid) {
          axios
            .post(this.url + 'Stadium', stadium)
            .then((response) => {
              this.dialogFormVisible = false
              this.$notify({
                title: i18n.t('notifications.success'),
                message: i18n.t('notifications.stadiumAddedSuccess'),
                type: 'success',
                duration: 2000
              })
              this.getStadium()
            })
            .catch((error) => {
              console.error(error.response)
            })
        }
      })
    },
    getStadium() {
      this.listLoading = true
      axios
        .get(this.url + 'Stadium')
        .then((response) => {
          console.log(response.data)
          this.list = response.data
          this.listLoading = false
        })
        .catch((error) => {
          this.status = 'error'
        })
    },
    handleDelete(row) {
      axios
        .delete(this.url + 'Stadium/' + row.id)
        .then((response) => {
          this.$notify({
            title: i18n.t('notifications.success'),
            message: i18n.t('notifications.deleteSuccessfully'),
            type: 'success',
            duration: 2000
          })
          this.getStadium()
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
          this.handleDelete(row)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: i18n.t('notifications.deleteCanceled')
          })
        })
    },
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
      this.formStadium.city_name = item.nameEnglish
      this.formStadium.cityId = item.id
    },
    handleIconClick(ev) {
      console.log(ev)
    }
  }
}
</script>
<style lang="scss">
