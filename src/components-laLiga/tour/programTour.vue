<template>
  <div class="app-container">
    <el-autocomplete
      v-model="tour"
      popper-class="my-autocomplete"
      :fetch-suggestions="getTour"
      placeholder="Please input"
      @select="handleSelect"
    >
      <i slot="suffix" class="el-icon-edit el-input__icon" />
      <template slot-scope="{ item }">
        <div class="value">
          {{ item.name }}
        </div>
      </template>
    </el-autocomplete>
    <h3>Tours</h3>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="Season" name="first">

        <el-row :gutter="40">

         <el-col v-for="(season, index) in seasons" :key="index" :span="6">
            <el-card class="box-card box-card-container">
              <div slot="header" class="clearfix">
                <span>{{season.label}}</span>
                <el-switch style="float: right;" v-model="value1">
                </el-switch>
              </div>

              <div v-for="(category, index) in season.category" :key="index">
                <div class="categoty-name">
                  {{category.categoryName}}
                </div>
                <el-form v-for="(form, index) in category.categoryForms" :key="index" :inline="true" :model="form" class="card-form-container demo-form-inline" size="mini">
                    <el-form-item class="card-form-item">
                      <el-autocomplete
                        class="inline-input"
                        v-model="form.chooseProvider"
                        :fetch-suggestions="querySearch"
                        placeholder="Please Input"
                        @select="handleSelect"
                      ></el-autocomplete>
                    </el-form-item>
                    <el-form-item class="card-form-item">
                      <el-input v-model="form.chooseNumber"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <el-button circle type="danger" icon="el-icon-delete" @click="RemoveForm(category.categoryForms, index)"></el-button>
                    </el-form-item>
                </el-form>
                <el-button type="primary" round size="mini" @click="AddForm(category.categoryForms)">Add</el-button>
              </div>
            </el-card>
         </el-col>

        </el-row>


      </el-tab-pane>
      <el-tab-pane label="Date" name="second">
        <div v-if="tour != ''" style="margin: 15px 0">
          <el-checkbox
            v-model="checkAll"
            style="margin: 15px 0"
            :indeterminate="isIndeterminate"
            @change="handleCheckAllChange"
          >Marcar todos</el-checkbox>
          <div style="margin: 15px 0" />
          <el-checkbox-group
            v-model="checkedTours"
            @change="handlecheckedToursChange"
          >
            <el-checkbox
              v-for="(tourDay, index) in aListTours"
              :key="index"
              :label="tourDay"
              border
              class="space"
            >
              {{ index + 1 + ". " + tourDay.name }}
              {{ tourDay.startDate | formatDate }}</el-checkbox>
          </el-checkbox-group>
        </div>
        <el-button
          v-show="tour != ''"
          type="primary"
          @click="postTourInstance"
        >Confirmar</el-button>
      </el-tab-pane>
      <el-tab-pane label="Config" name="second">
        <div class="filter-container">
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
            @change="tableKey = tableKey + 1"
          >
            {{ $t("table.select") }}
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
            :label="$t('tour.nameTour')"
            min-width="100px"
            align="center"
          >
            <template slot-scope="{ row }">
              <span>{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('tour.nameProvider')"
            min-width="100px"
            align="center"
          >
            <template slot-scope="{ row }">
              <span>{{ row.providerName }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('tour.durationTour')"
            min-width="100px"
            align="center"
          >
            <template slot-scope="{ row }">
              <span>{{ row.duration_in_days }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('tour.status')"
            min-width="100px"
            align="center"
          >
            <template slot-scope="{ row }">
              <el-tooltip
                class="item"
                effect="dark"
                content="provider disabled"
                placement="top-start"
                :disabled="row.providerStatus"
              >
                <el-switch
                  v-model="row.status"
                  active-color="#619b97"
                  inactive-color="#f5365c"
                  :disabled="!row.providerStatus"
                  @change="changeStatus(row, $event)"
                />
              </el-tooltip>
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
            <el-form-item :label="$t('stadium.nameEnglish')" prop="nameEnglish">
              <el-input v-model="formCategory.nameEnglish" />
            </el-form-item>
            <el-form-item
              :label="$t('stadium.nameEspanish')"
              prop="nameEspanish"
            >
              <el-input v-model="formCategory.nameEspanish" />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">
              {{ $t("table.cancel") }}
            </el-button>
            <el-button
              type="primary"
              @click="
                dialogStatus === 'create' ? postTourInstance() : updateData()
              "
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
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { fetchList, fetchPv } from '@/api/article'
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
const tourDayOptions = [
  'Real Madrid Fan-1',
  'Real Madrid Fan-2',
  'Real Madrid Fan-3',
  'Real Madrid Fan-4',
  'Real Madrid Fan-5',
  'Real Madrid Fan-6',
  'Real Madrid Fan-7'
]
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
      listTours: null,
      total: 0,
      listLoading: true,
      search: '',
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
        nameEnglish: [
          {
            required: true,
            message: 'Please input text',
            trigger: 'blur'
          }
        ],
        nameEspanish: [
          {
            required: true,
            message: 'Please input text',
            trigger: 'blur'
          }
        ]
      },
      downloadLoading: false,
      /** FormStadium */
      formCategory: {
        nameEnglish: '',
        nameEspanish: ''
      },

      categoryStadiumList: [],
      /* EndPoint */
      url: this.$store.getters.url,
      multipleSelection: [],
      activeName: 'first',
      list: [],
      loading: false,
      tour: '',
      tourSelected: null,
      aListTours: [],
      aListToursFinal: [],
      /* checkbox */
      checkAll: false,
      checkedTours: [],




      //START DATA FOR SEASON TAB ------------------------------------------

      seasons: [
        {
          value: "Option1",
          label: "Baja",
          category: [
            {
              categoryName:"Plus",
              categoryForms: [
                {
                  chooseProvider: "",
                  chooseNumber: 0                   
                },
              ]
            },
            {
            categoryName: "Clasica",
            categoryForms: [
              {
                chooseProvider: "",
                chooseNumber: 0 
              }
            ]
            }
          ]
        },
        {
          value: "Option2",
          label: "Media",
          category: [
            {
              categoryName:"Plus",
              categoryForms: [
                {
                  chooseProvider: "",
                  chooseNumber: 0                   
                },
              ]
            },
            {
            categoryName: "Clasica",
            categoryForms: [
              {
                chooseProvider: "",
                chooseNumber: 0                   
              }
            ]
            }
          ]
        },
        {
          value: "Option3",
          label: "Alta",
        },
    //{
      //    value: "Option4",
         // label: "Custom",
        //},
        //{
         // value: false,
          //label: "new Season...",
        //},
      ],


     

      season: [],
      name_categories: "",


      //END DATA FOR SEASON TAB ------------------------------------------------
    }


  },
 
  /* INPUT SEARCH */
  computed: {
    listTour() {
      if (this.list) {
        return this.list.filter((item) => {
          return item.name.toLowerCase().includes(this.search.toLowerCase())
        })
      }
    },
      isIndeterminate: true,
      active: 0,
      formTour: {
        name: "",
        duration_in_days: 0,
        status: false,
        idProvider: 0,
        providerName: "",
        hotel_category: [],
        options: [],
      },
      idTourCreated: 0,
      formDayDetail: [],
      getDayDescription: [],
      arrayPosition: 0,
      tourUpdate: [],
      activeNames: [0],
      start_date: new Date(),
      formImageTour: {
        MediaContentType: 0,
        idTour: 0,
      },
      aTourCategory: [],
      editTourDayDescription: false,
      editFormTourDayDescription: [],
      tourList: [],
      sCity: "",
      fileUploads: [],
      dialogVisible: false,
      dialogImageUrl: "",
      formSeason: {
        nameEnglish: "",
        nameEspanish: "",
        stadiumId: "",
        stadiumName: "",
      },
      rules: {
        nameEnglish: [
          {
            required: true,
            message: i18n.t("forms.nameIncomplete"),
            trigger: "blur",
          },
        ],
        nameEspanish: [
          {
            required: true,
            message: i18n.t("forms.nameIncomplete"),
            trigger: "blur",
          },
        ],
      },
    
      
  },
  created() {},
  methods: {


    //----START METHODS FOR SEASON TAB----//

    AddForm(list){
      list.push({chooseProvider: "", chooseNumber: 0})
    },

    RemoveForm(list, n){
      if(list.length >= 2){
        list.splice(n, 1)
      }
    },


    //----END METHODS FOR SEASON TAB----//

    /* TABLE */
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then((response) => {
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
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
    /* Category */
    handleClose(done) {
      this.$confirm(i18n.t('modal.closeFormMsg'))
        .then((_) => {
          done()
        })
        .catch((_) => {})
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then((excel) => {
        const tHeader = ['id', 'nameEnglish', 'nameEspanish']
        const filterVal = ['id', 'name', 'nameEspanish']
        const data = this.formatJson(filterVal)
        const date = new Date()
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'RoomType' + date
        })
        this.downloadLoading = false
      })
    },
    resetTemp() {
      this.formCategory = {
        nameEnglish: '',
        nameEspanish: ''
      }
    },
    /* POST */
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    postTourInstance() {
      console.log(this.checkedTours)
      var tour = {
        duration_in_days: this.listTours.duration_in_days,
        id: this.listTours.id,
        idProvider: this.listTours.idProvider,
        instancesQuantity: this.listTours.instancesQuantity,
        isMaster: this.listTours.isMaster,
        masterTourId: this.listTours.masterTourId,
        name: this.listTours.name,
        providerName: this.listTours.providerName,
        providerStatus: this.listTours.providerStatus,
        status: this.listTours.status,
        tourCategories: this.listTours.tourCategories,
        tourDayDescriptions: this.listTours.tourDayDescriptions,
        tourInstances: this.aListToursFinal
      }

      axios
        .post(this.url + 'Tour/AddTourInstanceFromTour', tour)
        .then((response) => {
          this.dialogFormVisible = false
          this.$notify({
            title: i18n.t('notifications.success'),
            message: i18n.t('notifications.cathegoryAddedSuccess'),
            type: 'success',
            duration: 2000
          })
        })
        .catch((error) => {
          console.error(error.response)
        })
    },
    /* UPDATE */
    handleUpdate(row) {
      console.log(row)
      this.hotelUpdate = row
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.formCategory.nameEnglish = row.nameEnglish
      this.formCategory.nameEspanish = row.nameEspanish
      this.formCategory.priorityOrder = row.priorityOrder
    },
    updateData() {
      this.$refs['formCategory'].validate((valid) => {
        if (valid) {
          var category = {
            id: this.hotelUpdate.id,
            nameEnglish: this.formCategory.nameEnglish,
            nameEspanish: this.formCategory.nameEspanish,
            priorityOrder: this.formCategory.priorityOrder
          }
          axios
            .put(this.url + 'StadiumCategory', category)
            .then((response) => {
              this.dialogFormVisible = false
              this.$notify({
                title: i18n.t('notifications.success'),
                message: i18n.t('notifications.uptadeSuccess'),
                type: 'success',
                duration: 2000
              })
            })
            .catch((error) => {
              console.error(error.response)
            })
        }
      })
    },
    /* GET */
    getTour(queryString, cb) {
      axios
        .get(this.url + 'Tour')
        .then((response) => {
          console.log(response.data)
          /* para que el autocomplete solo muestre los tours padres */
          var links = response.data
          var aTours = []
          this.list = response.data
          aTours = response.data.map((item) => {
            console.log(item.isMaster)
            return item.isMaster ? item : 1
          })
          console.log(aTours)
          links = aTours.filter((element) => element !== 1)
          var results = queryString
            ? links.filter(this.createFiltertourDay(queryString))
            : links
          cb(results)
        })
        .catch((error) => {
          this.status = 'error'
          console.error(error.response)
        })
    },
    createFiltertourDay(queryString) {
      return (link) => {
        return link.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0
      }
    },
    handleSelect(item) {
      console.log(item)
      this.tour = item.name
      this.tourSelected = 52
      this.listTours = item
      console.log(this.listTours)
      /* para listar los tours hijos */

      var aTourChildren = []
      aTourChildren = this.list.map((item) => {
        console.log(item.masterTourId, this.listTours.id)
        return item.masterTourId === this.listTours.id ? item : 1
      })
      console.log(aTourChildren)
      this.list = aTourChildren.filter((element) => element !== 1)
      console.log(this.list)
      this.listLoading = false
      this.caculateDate(
        item.name,
        item.tourDayDescriptions[0].startTime,
        item.id
      )
    },
    handleIconClick(ev) {
      console.log(ev)
    },
    handleCheckAllChange(val) {
      console.log(val)
      this.checkedTours = val ? this.aListTours : []
      this.isIndeterminate = false
    },
    handlecheckedToursChange(value) {
      console.log(value)
      this.aListToursFinal = value
      const checkedCount = value.length
      this.checkAll = checkedCount === this.aListTours.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.aListTours.length
    },
    handleClick(tab, event) {
      console.log(tab, event)
    },
    caculateDate(tourName, initialDate, idTour) {
      console.log(tourName, initialDate)
      const date = new Date(initialDate)
      this.aListTours = []
      for (let index = 0; index < 52; index++) {
        this.aListTours.push({
          tourId: idTour,
          name: tourName,
          startDate: new Date(date.setDate(date.getDate() + 7))
        })
      }
      this.checkedTours = this.aListTours
      this.aListToursFinal = this.aListTours

      console.log(this.aListTours)
    },
    /* DELETE */
    handleSelectionChange(val) {
      this.categoryStadiumList = val
    },
    handleDelete(row, selected) {
      var id = selected ? row : row.id
      axios
        .delete(this.url + 'StadiumCategory/' + id)
        .then((response) => {
          this.$notify({
            title: i18n.t('notifications.success'),
            message: i18n.t('notifications.deleteSuccessfully'),
            type: 'success',
            duration: 2000
          })
          this.showReviewer = false
          this.categoryStadiumList = []
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
          this.categoryStadiumList.forEach((value) => {
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
    handleClick(tab, event) {
      console.log(tab, event)
    }
  }
}
</script>
<style lang="scss">
.card-form-container{
  display: flex;
}
.el-message-box{
  width: 95%;
  max-width: 418px;
  margin: .5rem;
}

.space {
  margin: 3px;
  width: 350px;
}
.el-checkbox.is-bordered + .el-checkbox.is-bordered {
  margin: 3px;
}
.box-card-container{
  min-height: 363.781px;
}
</style>
