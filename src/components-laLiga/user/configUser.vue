<template>
  <div class="app-container">
    <h2 v-permission="['admin']" >ESTOY AQUI ADMIN</h2>
    <h2 v-permission="['editor']" >ESTOY AQUI EDITOR</h2>
    <h2 v-permission="['admin', 'editor']" >ESTOY AQUI AMBOS</h2>
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
import permission from '@/directive/permission/index.js'
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
  directives: { waves, permission },
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
