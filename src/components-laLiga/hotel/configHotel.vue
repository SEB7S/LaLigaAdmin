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
        v-if="showReviewer && this.hotelList.length > 0"
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
      :data="hotel"
      size="mini"
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
        :label="$t('hotel.cityHotel')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.cityName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('provider.categories')"
        min-width="100px"
        align="center"
        empty-text="ssdsd"
      >
        <template slot-scope="{ row }">
          <span>{{ row.happyTourCategoryName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('provider.categoryProvider')"
        min-width="100px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.providerCategoryName }}</span>
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
          <el-tooltip
            class="item"
            effect="dark"
            content="provider disabled"
            placement="top-start"
            :disabled="row.providerStatus"
          >
            <el-switch
              v-model="row.statusActive"
              active-color="#619b97"
              inactive-color="#f5365c"
              @change="changeStatus(row, $event)"
              :disabled="!row.providerStatus"
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
      <el-steps :active="active" align-center finish-status="success">
        <el-step title="General Data"></el-step
        ><el-step title="Room Type"></el-step>
        <el-step title="Image / Description"></el-step>
      </el-steps>
      <div v-if="active == 0">
        <el-form
          ref="formHotel"
          :model="formHotel"
          :rules="rules"
          label-position="top"
          label-width="120px"
          style="margin: 30px"
        >
          <el-form-item :label="$t('hotel.nameEnHotel')" prop="nameEnglish">
            <el-input v-model="formHotel.nameEnglish" />
          </el-form-item>
          <el-form-item :label="$t('hotel.nameEsHotel')" prop="nameSpanish">
            <el-input v-model="formHotel.nameSpanish" />
          </el-form-item>
          <el-form-item :label="$t('hotel.providerHotel')" prop="providerName">
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
          <el-form-item
            :label="$t('provider.categoryProvider')"
            prop="providerName"
          >
            <el-autocomplete
              v-model="formHotel.providerCategoryName"
              popper-class="my-autocomplete"
              :fetch-suggestions="getCatProvider"
              placeholder="Please input"
              style="width: 100%"
              @select="handleSelectCatProvider"
            >
              <i slot="suffix" class="el-icon-edit el-input__icon" />
              <template slot-scope="{ item }">
                <div class="value">{{ item.name }}</div>
              </template>
            </el-autocomplete>
          </el-form-item>
          <el-form-item :label="$t('hotel.cityHotel')" prop="city_name">
            <el-autocomplete
              v-model="formHotel.city_name"
              popper-class="my-autocomplete"
              :fetch-suggestions="getCities"
              placeholder="Please input"
              style="width: 100%"
              @select="handleSelectCity"
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
      </div>
      <div v-if="active == 1">
        <el-form
          ref="formRoomType"
          :rules="rules"
          style="margin-top: 30px; display: flex; justify-content: center"
          label-position="top"
        >
          <div>
            <el-row
              :gutter="20"
              v-for="(room, counter) in formRoomType"
              v-bind:key="counter"
            >
              <el-col :span="6" :xs="24" :sm="24" :md="7" :lg="7" :xl="7"
                ><div class="grid-content">
                  <el-form-item>
                    <el-autocomplete
                      v-model="room.nameEnglish"
                      popper-class="my-autocomplete"
                      :fetch-suggestions="getRoomType"
                      placeholder="Name En"
                      style="width: 100%"
                      @select="handleSelect"
                      @focus="arrayPosition = counter"
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
                </div></el-col
              >
              <el-col :span="6" :xs="24" :sm="24" :md="7" :lg="7" :xl="7"
                ><div class="grid-content">
                  <el-form-item>
                    <el-input
                      v-model="room.nameEspanish"
                      placeholder="Name Es"
                      disabled
                    />
                  </el-form-item></div
              ></el-col>
              <el-col :span="6" :xs="24" :sm="24" :md="7" :lg="7" :xl="7"
                ><div class="grid-content">
                  <el-form-item>
                    <el-input
                      v-model="room.maxPax"
                      disabled
                      placeholder="Max Pax"
                    />
                  </el-form-item></div
              ></el-col>
              <el-col :span="6" :xs="24" :sm="24" :md="3" :lg="3" :xl="3"
                ><div class="grid-content bg-purple">
                  <el-form-item>
                    <el-button
                      type="danger"
                      @click="deleteRoom(counter)"
                      icon="el-icon-delete"
                    ></el-button>
                  </el-form-item></div
              ></el-col>
            </el-row>
          </div>
        </el-form>
        <el-button type="primary" @click="addRoom">+</el-button>
      </div>
      <div v-if="active == 2">
        <el-form
          ref="formHotel"
          label-position="top"
          label-width="120px"
          style="margin: 30px"
        >
          <el-form-item :label="$t('hotel.image')">
            <el-upload
              :action="url + 'HotelMediaImage/SendHotelImage'"
              list-type="picture-card"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
              name="UploadImage"
              :data="formImageHotel"
              :file-list="fileList"
              :on-success="handleSuccess"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
          </el-form-item>
          <el-form-item :label="$t('hotel.description')">
            <el-input
              type="textarea"
              :rows="2"
              placeholder="Please input"
              v-model="description"
              maxlength="150"
              show-word-limit
            >
            </el-input>
          </el-form-item>
        </el-form>

        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </div>

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
import { forEach } from "jszip/lib/object";
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
  name: "ConfigHotel",
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
      city_name: "",
      city_nameEs: "",
      cities: [],
      /** FormStadium */
      formHotel: {
        nameEnglish: "",
        nameSpanish: "",
        cityId: "",
        city_name: "",
        providerId: "",
        providerName: "",
        providerCategoryName: "",
        providerCategoryId: 0,
        statusActive: true,
      },
      hotelUpdate: [],
      /* EndPoint */
      url: this.$store.getters.url,
      urlImgage: this.$store.getters.urlImgage,
      description: "",
      search: "",
      rules: {
        nameEnglish: [
          {
            required: true,
            message: "Please input name",
            trigger: "change",
          },
          {
            min: 3,
            message: "Length should be 3",
            trigger: "blur",
          },
        ],

        nameSpanish: [
          {
            required: true,
            message: "Please input name",
            trigger: "change",
          },
          {
            min: 3,
            message: "Length should be 3",
            trigger: "blur",
          },
        ],
        providerName: [
          {
            required: true,
            message: "Please input provider",
            trigger: "change",
          },
        ],
        city_name: [
          {
            required: true,
            message: "Please input city",
            trigger: "change",
          },
        ],
        name_en: [
          {
            required: true,
            message: "Please input name",
            trigger: "change",
          },
          {
            min: 3,
            message: "Length should be 3",
            trigger: "blur",
          },
        ],
        name_es: [
          {
            required: true,
            message: "Please input name",
            trigger: "change",
          },
          {
            min: 3,
            message: "Length should be 3",
            trigger: "blur",
          },
        ],
      },
      formImageHotel: {
        MediaContentType: 0,
        idHotel: 0,
        id: 0,
      },
      formRoomType: [
        {
          id: "",
          nameEspanish: "",
          nameEnglish: "",
          maxPax: 0,
        },
      ],
      active: 0,
      /* Images */
      dialogImageUrl: "",
      dialogVisible: false,
      roomType: {},
      fileList: [],
      hotelList: [],
      arrayPosition: 0,
      roomTypeDefault:[]
    };
  },
  created() {
    this.getHotel();
    this.getRoomType();
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
      this.formHotel = {
        nameEnglish: "",
        nameSpanish: "",
        cityId: "",
        city_name: "",
        providerId: 0,
        providerName: "",
        providerCategoryName: "",
        providerCategoryId: 0,
        statusActive: true,
      };
      this.city_name = "";
      this.fileList = [];
      console.log(this.roomTypeDefault)
      this.formRoomType = [
        {
          id: this.roomTypeDefault[0].id,
          nameEspanish: this.roomTypeDefault[0].nameEspanish,
          nameEnglish: this.roomTypeDefault[0].nameEnglish,
          maxPax: this.roomTypeDefault[0].maxPax,
        },
      ];
      this.active = 0;
    },
    handleUpdate(row) {
      this.resetTemp();
      this.getImageByIdHotel(row);
      this.hotelUpdate = row;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.formHotel.nameEnglish = row.nameEnglish;
      this.formHotel.nameSpanish = row.nameSpanish;
      this.formHotel.city_name = row.cityName;
      this.formHotel.providerName = row.providerName;
      this.formHotel.statusActive = row.statusActive;
      this.formHotel.cityId = row.cityId;
      this.formHotel.providerId = row.providerId;
      this.formHotel.providerCategoryName = row.providerCategoryName;
      this.formHotel.providerCategoryId = row.providerCategoryId;
      this.formImageHotel.idHotel = row.id;
      this.getRoomTypeById();
      console.log(this.formRoomType);
    },
    updateData() {
      if (this.active == 0) {
        this.$refs["formHotel"].validate((valid) => {
          this.next();
        });
      } else if (this.active == 1) {
        var hotel = {
          id: this.hotelUpdate.id,
          cityId: this.formHotel.cityId,
          nameEnglish: this.formHotel.nameEnglish,
          nameSpanish: this.formHotel.nameSpanish,
          categoryId: this.formHotel.categoryId,
          providerId: this.formHotel.providerId,
          providerCategoryId: this.formHotel.providerCategoryId,
          statusActive: this.formHotel.statusActive,
          hotelRoomTypes: [],
        };
        console.log(this.formRoomType);
        this.formRoomType.forEach((element, index) => {
          var roomType = {
            id: element.oldId,
            hotelId: 0,
            roomTypeId: element.id,
          };
          hotel.hotelRoomTypes.push(roomType);
          console.log(this.formRoomType);
        });
        axios
          .put(this.url + "Hotel", hotel)
          .then((response) => {
            this.$notify({
              title: "Success",
              message: "Update Successfully",
              type: "success",
              duration: 2000,
            });

            this.getHotel();
            this.next();
          })
          .catch((error) => {
            console.error(error.response);
          });
        console.log(this.active);
      } else if (this.active == 2) {
      }
    },
    getRoomTypeById() {
      this.formRoomType = [];
      this.hotelUpdate.hotelRoomTypes.forEach((element) => {
        var room = {
          id: element.id,
          nameEspanish: element.roomtypeEnglish,
          nameEnglish: element.roomtypeSpanish,
          maxPax: element.maxPax,
          oldId: element.roomTypeId,
        };
        this.formRoomType.push(room);
      });
    },
    getImageByIdHotel(hotel) {
      axios
        .get(this.url + "HotelMediaImage/GetAllByHotel?idhotel=" + hotel.id)
        .then((response) => {
          console.log(response.data);
          this.fileList = response.data;
        })
        .catch((error) => {
          this.status = "error";
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
      const sort = this.listQuery.sort;
      return sort === `+${key}` ? "ascending" : "descending";
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.active = 0;
    },
    postHotel() {
      if (this.active == 0) {
        this.$refs["formHotel"].validate((valid) => {
          this.next();
        });
      } else if (this.active == 1) {
        var hotel = {
          nameEnglish: this.formHotel.nameEnglish,
          nameSpanish: this.formHotel.nameSpanish,
          cityId: this.formHotel.cityId,
          providerCategoryId: this.formHotel.providerCategoryId,
          statusActive: this.formHotel.statusActive,
          hotelRoomTypes: [],
        };
        this.formRoomType.forEach((element, index) => {
          var roomType = {
            hotelId: 0,
            roomTypeId: element.id,
          };
          hotel.hotelRoomTypes.push(roomType);
          console.log(hotel);
        });

        axios
          .post(this.url + "Hotel", hotel)
          .then((response) => {
            this.formImageHotel.idHotel = response.data[0].id;
            console.log(response, response.data[0].id);

            this.$notify({
              title: "Success",
              message: "Hotel Agregado con éxito",
              type: "success",
              duration: 2000,
            });
            this.getHotel();
            this.next();
          })
          .catch((error) => {
            console.error(error.response);
          });
      } else if (this.active == 2) {
      }
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
    handleDelete(row, selected) {
      var id = selected ? row : row.id;
      axios
        .delete(this.url + "Hotel/" + id)
        .then((response) => {
          this.$notify({
            title: "Success",
            message: "Delete Successfully",
            type: "success",
            duration: 2000,
          });
          this.getHotel();
          this.showReviewer = false;
          this.hotelList = [];
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
        this.hotelList.push(arr.id);
      } else {
        this.removeItemFromArr(this.hotelList, arr.id);
      }
      console.log(this.hotelList);
    },
    removeItemFromArr(arr, item) {
      var i = arr.indexOf(item);

      if (i !== -1) {
        arr.splice(i, 1);
      }
    },
    handleDeleteAll() {
      /* delet duplicated id's */
      console.log(this.hotelList);
      const clearList = [...new Set(this.hotelList)];
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
    handleSelectCity(item) {
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
      this.formHotel.providerCategoryName = "";
    },
    getCatProvider(queryString, cb) {
      axios
        .get(
          this.url +
            "Hotel/GetCategoriesByProviderId?id=" +
            this.formHotel.providerId
        )
        .then((response) => {
          console.log(response.data.categories);
          var links = response.data[0].categories;
          var results = queryString
            ? links.filter(this.createFilterCatProv(queryString))
            : links;
          cb(results);
        })
        .catch((error) => {
          this.status = "error";
          console.error(error.response);
        });
    },
    createFilterCatProv(queryString) {
      return (link) => {
        return link.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
      };
    },
    handleSelectCatProvider(item) {
      this.formHotel.providerCategoryName = item.name;
      this.formHotel.providerCategoryId = item.id;
    },
    changeStatus(data, status) {
      this.$confirm(
        `Do you want to ${status ? "activate " : "inactivate"} this status?`,
        "Warning",
        {
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          type: "warning",
        }
      )
        .then(() => {
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
        })
        .catch(() => {
          this.getHotel();
        });
    },
    next() {
      if (this.active++ > 2) this.active = 0;
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
      axios
        .delete(this.url + "HotelMediaImage/DeleteHotelMedia?id=" + file.id)
        .then((response) => {
          this.$notify({
            title: "Success",
            message: "Delete Successfully",
            type: "success",
            duration: 2000,
          });
        })
        .catch((error) => {
          console.error(error.response);
        });
    },
    handlePictureCardPreview(file) {
      console.log(file);
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleSuccess(response, file, fileList) {
      this.formImageHotel.id = response.id;
    },
    addRoom() {
      this.formRoomType.push({
        id: "",
        nameEspanish: "",
        nameEnglish: "",
        maxPax: 0,
      });
    },
    deleteRoom(counter) {
      this.formRoomType.splice(counter, 1);
    },
    handleClose(done) {
      this.$confirm("Are you sure to close this form?")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
    /* ROOMTYPES */
    getRoomType(queryString, cb) {
      axios
        .get(this.url + "RoomType")
        .then((response) => {
          console.log(response.data);
          response.data.forEach(element => {
            if(element.maxPax == 2){
              console.log(element, element.maxPax == 2)
              this.roomTypeDefault[0] = element
            }
          });
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
    handleSelect(item) {
      console.log(item);
      this.formRoomType[this.arrayPosition].nameEnglish = item.nameEnglish;
      this.formRoomType[this.arrayPosition].id = item.id;
      this.formRoomType[this.arrayPosition].nameEspanish = item.nameEspanish;
      this.formRoomType[this.arrayPosition].maxPax = item.maxPax;
    },
    handleIconClick(ev) {
      console.log(ev);
    },
  },
  computed: {
    hotel() {
      if (this.list) {
        return this.list.filter((item) => {
          return (
            item.nameEnglish
              .toLowerCase()
              .includes(this.search.toLowerCase()) ||
            item.nameSpanish
              .toLowerCase()
              .includes(this.search.toLowerCase()) ||
            item.cityName.toLowerCase().includes(this.search.toLowerCase()) ||
            item.providerName
              .toLowerCase()
              .includes(this.search.toLowerCase()) ||
            item.providerCategoryName
              .toLowerCase()
              .includes(this.search.toLowerCase()) ||
            item.happyTourCategoryName
              .toLowerCase()
              .includes(this.search.toLowerCase())
          );
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