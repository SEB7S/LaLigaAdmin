<template>
  <div class="app-container">
    <el-autocomplete
      v-model="tour"
      popper-class="my-autocomplete"
      :fetch-suggestions="getTour"
      placeholder="Tour"
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
      <el-tab-pane :label="$t('tour.season')" name="first">
        <el-button v-if="tour != ''" type="primary" round @click="postSeason"
          >Next</el-button
        >
        <el-row v-if="tour != ''" :gutter="40">
          <el-col
            v-for="(season, index) in seasons"
            :key="index"
            :xs="24"
            :sm="12"
            :md="6"
          >
            <el-card class="box-card box-card-container">
              <div class="box-card-header" slot="header">
                <div class="delete-card-button">
                  <div class="card-checkbox-container">
                    <el-checkbox
                      class="header-checkbox"
                      v-model="season.priority"
                      @change="setDefault(index)"
                      >{{ $t("tour.priority") }}</el-checkbox
                    >
                    <el-checkbox
                      class="header-checkbox"
                      v-model="season.applyToTourParent"
                      @change="applyToTourParent(index)"
                      >{{ $t("tour.applyToFather") }}</el-checkbox
                    >
                  </div>
                  <el-button
                    v-if="index > 2"
                    type="text"
                    circle
                    icon="el-icon-close"
                    size="small"
                    @click="DeleteCard(index)"
                  ></el-button>
                </div>
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="$t('tour.clickToEdit')"
                  placement="top"
                >
                  <span
                    class="card-name"
                    :class="{ 'card-name-onfocus': season.changeName == false }"
                    :ref="'name' + index"
                    @keyup.enter="verifyCardName(index, $event)"
                    @focusout="verifyCardName(index, $event)"
                    @click="verifyCardName(index, $event)"
                  >
                    <el-form :model="season" ref="season">
                      <el-form-item
                        style="margin: 0"
                        prop="label"
                        :rules="formRules.name[0]"
                      >
                        <el-input
                          :readonly="season.changeName"
                          v-model="season.label"
                        />
                      </el-form-item>
                    </el-form>
                    <el-button
                      icon="el-icon-edit"
                      type="text"
                      size="small"
                    ></el-button>
                  </span>
                </el-tooltip>
                <el-switch
                  style="float: right; vertical-align: middle; margin: 0.3rem"
                  :disabled="season.changeName == false"
                  v-model="season.status"
                >
                </el-switch>
              </div>

              <div
                v-for="(category, index2) in season.categories"
                :key="index2"
              >
                <div class="categoty-name">
                  {{ category.categoryName }}
                  <el-switch
                    style="
                      float: right;
                      vertical-align: middle;
                      margin-right: 0.5rem;
                      width: 30px;
                    "
                    :disabled="season.status == false"
                    v-model="category.disableCategory"
                  >
                  </el-switch>
                </div>
                <el-form
                  v-for="(acc, index3) in category.accomodations"
                  :key="index3"
                  :disabled="
                    DisableButton(category.disableCategory, season.status)
                  "
                  :inline="true"
                  size="mini"
                  ref="acc"
                  :model="acc"
                  class="card-form-container demo-form-inline"
                >
                  <el-form-item class="card-form-item">
                    <el-select
                      v-model="acc.chooseProvider"
                      filterable
                      placeholder="Accommodation"
                      @change="
                        HandleAccoSelect($event, category.accomodations[index3])
                      "
                    >
                      <el-option
                        v-for="item in FilterAccoList(
                          category.accomodations,
                          aAccommodation
                        )"
                        :key="item.id"
                        :label="item.nameEnglish"
                        :value="{ id: item.id, accoType: item.nameEnglish }"
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    class="card-form-item"
                    prop="price"
                    :rules="formRules.price[0]"
                  >
                    <el-input v-model="acc.price"> </el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-button
                      circle
                      type="danger"
                      icon="el-icon-delete"
                      @click="RemoveForm(category.accomodations, index3, acc)"
                    ></el-button>
                  </el-form-item>
                </el-form>
                <el-button
                  type="primary"
                  round
                  size="mini"
                  @click="AddForm(category.accomodations)"
                  :disabled="
                    DisableAddFormBtn(
                      category.accomodations,
                      aAccommodation,
                      season.status
                    )
                  "
                  >{{ $t("tour.add") }}</el-button
                >
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="add-card box-card-container">
              <el-tooltip content="Add new card" placement="top">
                <el-button
                  class="add-card-button"
                  circle
                  size="medium"
                  type="primary"
                  icon="el-icon-plus"
                  @click="AddNewCard()"
                >
                </el-button>
              </el-tooltip>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane
        :disabled="activeName == 'first'"
        :label="$t('tour.date')"
        name="second"
      >
        <el-button
          v-show="tour != ''"
          type="primary"
          round
          @click="postTourInstance"
          >Next</el-button
        >
        <div v-if="tour != ''" style="margin: 15px 0">
          <el-checkbox
            style="margin: 15px 0"
            :indeterminate="isIndeterminate"
            v-model="checkAll"
            @change="handleCheckAllChange"
            >Marcar todos</el-checkbox
          >
          <div style="margin: 15px 0"></div>

          <el-checkbox-group
            style="display: grid"
            v-model="checkedTours"
            @change="handlecheckedToursChange"
          >
            <el-row :gutter="20">
              <el-col :span="6"
                ><div class="grid-content bg-purple">
                  <el-checkbox
                    v-for="(tourDay, index) in aListTours"
                    :label="tourDay.nameInstance"
                    :key="index"
                    border
                    class="space"
                    :disabled="tourDay.disabled"
                  >
                    {{ tourDay.nameInstance }}
                    {{ tourDay.startDate | formatDate }}
                  </el-checkbox>
                </div></el-col
              >
              <el-col :span="6">
                <div
                  v-for="(tourDay, index) in aListTours"
                  :label="tourDay.nameInstance"
                  :key="index"
                >
                  <el-select
                    v-model="tourDay.seasonName"
                    placeholder="Select"
                    :disabled="tourDay.disabled"
                    style="margin: 3px"
                    @change="itemSelected"
                  >
                    <el-option
                      v-for="item in seasons"
                      :key="item.seasonId"
                      :label="item.label"
                      :value="item.label"
                    >
                    </el-option>
                  </el-select>
                </div>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </div>
      </el-tab-pane>
      <el-tab-pane
        :disabled="activeName == 'first'"
        :label="$t('tour.config')"
        name="third"
      >
        <div class="filter-container">
          <el-input
            placeholder="Search"
            style="width: 200px"
            class="filter-item"
            v-model="search"
            @keyup.enter.native="handleFilter"
          />
          <el-button
            v-waves
            :loading="downloadLoading"
            class="filter-item"
            type="primary"
            icon="el-icon-download"
            @click="handleDownload"
            style="margin-left: 10px"
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
            v-if="showReviewer && this.aTourList.length > 0"
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
          >
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
          <el-table-column label="start Date" min-width="100px" align="center">
            <template slot-scope="{ row }">
              <span v-if="row.tourDayDescriptions.length > 0"
                >{{ row.tourDayDescriptions[0]["startTime"] | formatDate }}
              </span>
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
          :close-on-click-modal="false"
        >
          <div>
            <el-steps :active="active" finish-status="success" align-center>
              <el-step :title="$t('tour.nameTour')" icon="el-icon-edit" />
              <el-step :title="$t('tour.stepTwoName')" icon="el-icon-date" />
            </el-steps>
          </div>
          <div style="margin-top: 60px; padding: 25px">
            <div v-if="active == 0">
              <el-form
                ref="formTour"
                :rules="rules"
                :model="formTour"
                label-position="top"
                label-width="120px"
              >
                <el-form-item :label="$t('tour.nameTour')" prop="name">
                  <el-input v-model="formTour.name" />
                </el-form-item>
                <el-form-item
                  :label="$t('tour.durationTour')"
                  prop="duration_in_days"
                >
                  <el-input-number
                    v-model="formTour.duration_in_days"
                    :min="1"
                    :max="35"
                  />
                </el-form-item>
                <el-form-item
                  :label="$t('provider.nameProvider')"
                  prop="providerName"
                >
                  <el-autocomplete
                    v-model="formTour.providerName"
                    popper-class="my-autocomplete"
                    :fetch-suggestions="getProviders"
                    placeholder="Please input"
                    style="width: 100%"
                    @select="handleSelectProv"
                  >
                    <i slot="suffix" class="el-icon-edit el-input__icon" />
                    <template slot-scope="{ item }">
                      <div class="value">{{ item.name }}</div>
                    </template>
                  </el-autocomplete>
                </el-form-item>
                <el-form-item
                  :label="$t('provider.categoryProvider')"
                  prop="hotel_category"
                >
                  <el-select
                    v-model="formTour.hotel_category"
                    multiple
                    filterable
                    placeholder="Select"
                  >
                    <el-option
                      v-for="item in formTour.options"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-form>
            </div>
            <div v-else-if="active == 1">
              <el-form
                ref="formTour2"
                :rules="rules"
                :model="temp"
                label-position="top"
                label-width="120px"
              >
                <el-form-item label="Start Day">
                  <el-date-picker
                    v-model="start_date"
                    type="date"
                    placeholder="Pick a day"
                    @change="calculateDays"
                  >
                  </el-date-picker>
                </el-form-item>
              </el-form>
              <el-collapse v-model="activeNames" accordion>
                <div
                  v-for="(formDay, counter) in formDayDetail"
                  :key="counter"
                  @click="arrayPosition = counter"
                >
                  <div class="grid-content">
                    <el-collapse-item
                      :title="
                        formDay.dayName +
                        formDay.startDate +
                        formDay.dayName2 +
                        ' ( ' +
                        formDay.titleTourCities +
                        ' ) '
                      "
                      :name="counter"
                    >
                      <el-form
                        ref="formTour"
                        :rules="rules"
                        :model="temp"
                        label-position="top"
                        label-width="120px"
                      >
                        <div>
                          <el-form-item label="City">
                            <el-autocomplete
                              v-model="formDay.cityName"
                              popper-class="my-autocomplete"
                              :fetch-suggestions="getCities"
                              placeholder="Please input"
                              style="width: 100%"
                              @select="handleSelectCity"
                              @focus="arrayPosition = counter"
                            >
                              <i
                                slot="suffix"
                                class="el-icon-edit el-input__icon"
                              />
                              <template slot-scope="{ item }">
                                <div
                                  v-show="item.hotels.length > 0"
                                  class="value"
                                >
                                  {{ item.nameEnglish }}
                                </div>
                              </template>
                            </el-autocomplete>
                          </el-form-item>
                          <el-form-item label="Tour Cities">
                            <el-input
                              placeholder="Please input"
                              v-model="sCity"
                              @keyup.enter.native="addTourCities(counter)"
                              clearable
                              :disabled="formDay.tourCities.length == 3"
                            >
                            </el-input>
                          </el-form-item>
                          <el-form-item>
                            <el-row
                              :gutter="20"
                              v-for="(tourCity, counter2) in formDay.tourCities"
                              :key="counter2"
                            >
                              <el-col :span="10"
                                ><div class="grid-content">
                                  <el-tag
                                    size="medium"
                                    closable
                                    @close="deleteTourCities(counter, counter2)"
                                  >
                                    {{ formDay.tourCities[counter2] }}
                                  </el-tag>
                                </div>
                              </el-col>
                            </el-row>
                          </el-form-item>
                          <el-form-item label="">
                            <el-switch
                              v-model="formDay.matchable"
                              active-text="Enable for match"
                              inactive-text=""
                            >
                            </el-switch>
                          </el-form-item>

                          <el-form-item
                            v-if="
                              (formDay.cityName != '' &&
                                dialogStatus === 'create') ||
                              (formDayDetail.length > 0 &&
                                formDayDetail[counter].cityName != '')
                            "
                            label="Image"
                          >
                            <el-upload
                              :action="''"
                              :http-request="uploadFile"
                              list-type="picture-card"
                              :on-preview="handlePictureCardPreview"
                              :on-remove="handleRemove"
                              :file-list="
                                formDayDetail.length > 0 &&
                                formDayDetail[counter].images
                                  ? formDayDetail[counter].images
                                  : formDay.images
                              "
                              name="UploadImage"
                              :data="formImageTour"
                            >
                              <i class="el-icon-plus"></i>
                            </el-upload>
                            <el-dialog :visible.sync="dialogVisible">
                              <img width="100%" :src="dialogImageUrl" alt="" />
                            </el-dialog>
                          </el-form-item>
                          <el-form-item label="Description English">
                            <el-input
                              v-model="formDay.description_english"
                              type="textarea"
                              placeholder="Please input"
                            />
                          </el-form-item>
                          <el-form-item label="Description Spanish">
                            <el-input
                              v-model="formDay.description_spanish"
                              type="textarea"
                              placeholder="Please input"
                            />
                          </el-form-item></div
                      ></el-form>
                    </el-collapse-item>
                  </div>
                </div>
              </el-collapse>
            </div>
          </div>

          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false"> Cancel </el-button>
            <el-button
              type="primary"
              @click="dialogStatus === 'create' ? postTour() : updateData()"
            >
              {{ active != 1 ? $t("table.next") : $t("table.confirm") }}
            </el-button>
          </div>
        </el-dialog>
        <el-dialog
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
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import Vue from "vue";
import { fetchList, fetchPv } from "@/api/article";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import axios from "axios";
import i18n from "@/lang/index.js";
import { variance } from "@babel/types";
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
    var priceValidator = (rule, value, callback) => {
      console.log(value, rule, "En input");
      var n = parseInt(value);
      if (!value) {
        callback(new Error(i18n.t("forms.incompleteInput")));
      } else if (!Number.isInteger(n)) {
        callback(new Error(i18n.t("forms.invalidFormat")));
      } else if (n < 100) {
        callback(new Error(i18n.t("forms.invalidPrice")));
      } else {
        callback();
      }
    };

    return {
      tableKey: 0,
      listTours: null,
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
            message: "Please input text",
            trigger: "blur",
          },
        ],
        nameEspanish: [
          {
            required: true,
            message: "Please input text",
            trigger: "blur",
          },
        ],
      },
      downloadLoading: false,
      /** FormStadium */
      formCategory: {
        nameEnglish: "",
        nameEspanish: "",
      },

      aTourList: [],
      /* EndPoint */
      url: this.$store.getters.url,
      multipleSelection: [],
      activeName: "first",
      list: [],
      loading: false,
      tour: "",
      tourSelected: null,
      aListTours: [],
      aListToursFinal: [],
      /* checkbox */
      checkAll: false,
      checkedTours: [],

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

      //START DATA FOR SEASON TAB ------------------------------------------
      allDefault: true,

      seasons: [],
      name_categories: "",
      categoryDefault: "",
      categoryIdDefault: 0,
      testList: {},
      aAccommodation: [], //Select accomodation
      getSeasons: [],
      validatorOne: this.priceValidator,

      formRules: {
        name: [
          {
            required: true,
            message: i18n.t("forms.nameIncomplete"),
            trigger: "blur",
          },
        ],
        price: [{ validator: priceValidator, trigger: "blur" }],
        accoType: [{}],
      },

      //END DATA FOR SEASON TAB ------------------------------------------------
    };
  },

  /* INPUT SEARCH */
  computed: {
    listTour() {
      if (this.list) {
        return this.list.filter((item) => {
          return item.name.toLowerCase().includes(this.search.toLowerCase());
        });
      }
    },
  },
  created() {},
  methods: {
    //----START METHODS FOR SEASON TAB----//
    FilterAccoList(usedAccomodatios, accoList) {
      var filterList = accoList.filter((acco) => {
        return !usedAccomodatios.some((usedAcco) => {
          return acco.nameEnglish == usedAcco.chooseProvider;
        });
      });
      return filterList;
    },
    HandleAccoSelect(event, item) {
      (item.chooseProvider = event.accoType), (item.accommodationId = event.id);
    },
    DisableButton: function (condition1, condition2) {
      return condition1 == false || condition2 == false;
    },
    AddForm(list) {
      list.push({
        accommodationId: 0,
        chooseProvider: "",
        price: 0,
      });
      console.log(list, "item");
    },
    DisableAddFormBtn: function (usedAccomodatios, accoList, condition) {
      return (
        this.FilterAccoList(usedAccomodatios, accoList).length == 0 ||
        usedAccomodatios.length == accoList.length ||
        condition == false
      );
    },
    RemoveForm(list, n, item) {
      if (list.length >= 2) {
        list.splice(n, 1);
      }
      /*  */ console.log(list, "item", item, this.seasons);
    },
    AddSeasonsCategories() {
      this.seasons.forEach((season) => {
        this.listTours.tourCategories.forEach((tourCategory) => {
          season.categories.push({
            categoryId: tourCategory.id,
            categoryName: tourCategory.providerCategoryName,
            disableCategory: true,
            accomodations: [
              {
                accommodationId: 16,
                chooseProvider: "Single",
                price: 0,
              },
              {
                accommodationId: 17,
                chooseProvider: "Double",
                price: 0,
              },
            ],
          });
        });
      });
      console.log("seasons", this.seasons);
    },
    setDefault(n) {
      this.categoryDefault = this.seasons[n].label;
      this.categoryIdDefault = this.seasons[n].seasonId;
      console.log(this.seasons[n], n, this.aListTours),
        this.seasons.forEach((season, index) => {
          if (index != n) {
            season.priority = false;
          }
        });
    },
    applyToTourParent(n) {
      this.seasons.forEach((season, index) => {
        if (index != n) {
          season.applyToTourParent = false;
        }
      });
    },
    AddNewCard() {
      this.seasons.push({
        label: "Custom",
        status: false,
        priority: false,
        changeName: false,
        applyToTourParent: false,
        categories: this.AddCategoriesInNewCard(),
      });
    },
    AddCategoriesInNewCard() {
      var categorylist = [];

      this.listTours.tourCategories.forEach((tourCategory) => {
        categorylist.push({
          categoryId: tourCategory.id,
          categoryName: tourCategory.providerCategoryName,
          disableCategory: true,
          accomodations: [
            {
              accommodationId: 16,
              chooseProvider: "Single",
              price: 0,
            },
            {
              accommodationId: 17,
              chooseProvider: "Double",
              price: 0,
            },
          ],
        });
      });
      return categorylist;
    },
    DeleteCard(n) {
      if (n > 2) {
        this.seasons.splice(n, 1);
      }
    },
    verifyCardName(n, event) {
      if (this.seasons[n].label != "") {
        switch (event.type) {
          case "click":
            this.seasons[n].changeName = false;
            break;
          case "keyup":
            this.seasons[n].changeName = true;
            break;

          case "focusout":
            this.seasons[n].changeName = true;
            break;

          default:
            this.seasons[n].changeName = true;
            break;
        }

        if (this.seasons[n].changeName) {
          this.seasons[n].status = true;
        } else {
          this.seasons[n].status = false;
        }
      }
    },
    getAccommodation() {
      axios
        .get(this.url + "RoomType")
        .then((response) => {
          this.aAccommodation = response.data;
        })

        .catch((error) => {
          this.status = "error";
          console.error(error.response);
        });
    },
    getSeason() {
      axios
        .get(this.url + "TourCategorySeason")
        .then((response) => {
          this.seasons = [];
          this.getSeason = [];
          this.getSeasons = response.data.filter(
            (element) => element.tourId == this.listTours.id
          );
          console.log("esto", this.getSeasons);
          let aSeasons = [];
          if (this.getSeasons.length > 0) {
            /* AGRUPAR RESPONSE POR SEASON */
            const groupByCategory = this.getSeasons.reduce((group, product) => {
              const { tourSeasonName } = product;
              group[tourSeasonName] = group[tourSeasonName] ?? [];
              group[tourSeasonName].push(product);
              return group;
            }, {});
            /* ALMACENAR SEASONS AGRUPADOS  EN ARRAY */
            for (var clave in groupByCategory) {
              // Controlando que json realmente tenga esa propiedad
              if (groupByCategory.hasOwnProperty(clave)) {
                // Mostrando en pantalla la clave junto a su valor
                console.log(groupByCategory[clave]);
                aSeasons.push(groupByCategory[clave]);
              }
            }
            /* RECORRIENDO SEASONS */
            console.log(aSeasons);
            let accomodations = [];
            let categories = [];
            let seasonInfo;
            aSeasons.forEach((season, indexsea) => {
              /* RECORRIENDO CAT DE TOUR PARA COMPARARLAS CON LAS SEASONS DE LA PETICION */
              this.listTours.tourCategories.forEach((category, indexcat) => {
                /* FILTRANDO CATEGORIAS POR CADA TEMPORADA */
                let cat = season.filter(
                  (categ) => categ.label == category.providerCategoryName
                );
                /* RECORRIENDO CATEGORIAS */
                cat.forEach((acc, indexacc) => {
                  /* se alamcenan las accomodations de cada categoria en un array (accomodations) */
                  accomodations.push({
                    accommodationId: acc.roomTypeId,
                    chooseProvider: acc.roomTypeNameEnglish,
                    price: acc.price,
                  });
                  console.log("cat", acc);
                  /* cuando el array filtrado de la categoria termine, se almacena la accomodacion en un nuevo array (categories) */
                  if (indexacc == cat.length - 1) {
                    categories.push({
                      categoryId: acc.tourCategoryId,
                      disableCategory: acc.disableCategory,
                      categoryName: acc.label,
                      disableCategory: true,
                      accomodations: accomodations,
                    });
                    accomodations = [];
                  }
                  console.log(this.seasons);
                  seasonInfo = acc;
                });
                /* cuando todas las categorias de una temporada sean recorridas, se alamcena en un nuevo array (seasons) */
                if (indexcat == this.listTours.tourCategories.length - 1) {
                  seasonInfo.priority
                    ? (this.categoryDefault = seasonInfo.tourSeasonName)
                    : seasonInfo.priority
                    ? (this.categoryIdDefault = seasonInfo.seasonId)
                    : console.log("funciona", this.categoryDefault);
                  this.seasons.push({
                    seasonId: seasonInfo.tourSeasonId,
                    label: seasonInfo.tourSeasonName,
                    tourId: seasonInfo.tourId,
                    status: true,
                    changeName: true,
                    priority: seasonInfo.priority,
                    applyToTourParent: seasonInfo.applyToTourParent,
                    categories: categories,
                  });
                  categories = [];
                }
                console.log("cat2", this.seasons, seasonInfo);
              });
            });
          } else {
            this.getSeasonDefault();
          }
          /* 
          let categories = [];
          let accomodation = [];

          let alta = getSeasons.filter((season) => season.tourSeasonName == "ALTA");
          let plusAlta = alta.filter(
            (categories) => categories.label == "Plus"
          );
          plusAlta.forEach((element, index) => {
            accomodation.push({
              accommodationId: element.roomTypeId,
              chooseProvider: element.roomTypeNameEnglish,
              price: element.price,
            });
            if (index == 1) {
              categories.unshift({
                categoryId: element.tourCategoryId,
                categoryName: element.label,
                disableCategory: true,
                accomodations: accomodation,
              });
            }
          });
          accomodation = [];
          let clasicaAlta = alta.filter(
            (categories) => categories.label == "Clasica"
          );
          clasicaAlta.forEach((element, index) => {
            accomodation.push({
              accommodationId: element.roomTypeId,
              chooseProvider: element.roomTypeNameEnglish,
              price: element.price,
            });
            if (index == 1) {
              categories.unshift({
                categoryId: element.tourCategoryId,
                categoryName: element.label,
                disableCategory: true,
                accomodations: accomodation,
              });
            }
          });
          accomodation = [];
          let turistaAlta = alta.filter(
            (categories) => categories.label == "Turista"
          );
          turistaAlta.forEach((element, index) => {
            accomodation.push({
              accommodationId: element.roomTypeId,
              chooseProvider: element.roomTypeNameEnglish,
              price: element.price,
            });
            if (index == 1) {
              categories.push({
                categoryId: element.tourCategoryId,
                categoryName: element.label,
                disableCategory: true,
                accomodations: accomodation,
              });
              this.seasons.push({
                seasonId: element.tourSeasonId,
                label: element.tourSeasonName,
                tourId: element.tourId,
                status: true,
                changeName: true,
                priority: element.priority,
                applyToTourParent: false,
                categories: categories,
              });
            }
          });

          categories = [];
          accomodation = [];
          let media = getSeasons.filter((season) => season.tourSeasonName == "MEDIA");
          let plusMedia = media.filter(
            (categories) => categories.label == "Plus"
          );
          plusMedia.forEach((element, index) => {
            accomodation.push({
              accommodationId: element.roomTypeId,
              chooseProvider: element.roomTypeNameEnglish,
              price: element.price,
            });
            if (index == 1) {
              categories.unshift({
                categoryId: element.tourCategoryId,
                categoryName: element.label,
                disableCategory: true,
                accomodations: accomodation,
              });
            }
          });
          let clasicaMedia = media.filter(
            (categories) => categories.label == "Clasica"
          );
          accomodation = [];
          clasicaMedia.forEach((element, index) => {
            accomodation.push({
              accommodationId: element.roomTypeId,
              chooseProvider: element.roomTypeNameEnglish,
              price: element.price,
            });
            if (index == 1) {
              categories.unshift({
                categoryId: element.tourCategoryId,
                categoryName: element.label,
                disableCategory: true,
                accomodations: accomodation,
              });
            }
          });
          accomodation = [];
          let turistaMedia = media.filter(
            (categories) => categories.label == "Turista"
          );
          turistaMedia.forEach((element, index) => {
            accomodation.push({
              accommodationId: element.roomTypeId,
              chooseProvider: element.roomTypeNameEnglish,
              price: element.price,
            });
            if (index == 1) {
              categories.push({
                categoryId: element.tourCategoryId,
                categoryName: element.label,
                disableCategory: true,
                accomodations: accomodation,
              });
              this.seasons.push({
                seasonId: element.tourSeasonId,
                label: element.tourSeasonName,
                tourId: element.tourId,
                status: true,
                changeName: true,
                priority: element.priority,
                applyToTourParent: false,
                categories: categories,
              });
            }
          });

          categories = [];
          accomodation = [];
          let baja = applyToTourParent.filter((season) => season.tourSeasonName == "BAJA");
          let plusBaja = baja.filter(
            (categories) => categories.label == "Plus"
          );
          let clasicaBaja = baja.filter(
            (categories) => categories.label == "Clasica"
          );
          plusBaja.forEach((element, index) => {
            accomodation.push({
              accommodationId: element.roomTypeId,
              chooseProvider: element.roomTypeNameEnglish,
              price: element.price,
            });
            if (index == 1) {
              categories.unshift({
                categoryId: element.tourCategoryId,
                categoryName: element.label,
                disableCategory: true,
                accomodations: accomodation,
              });
            }
          });
          accomodation = [];
          clasicaBaja.forEach((element, index) => {
            accomodation.push({
              accommodationId: element.roomTypeId,
              chooseProvider: element.roomTypeNameEnglish,
              price: element.price,
            });
            if (index == 1) {
              categories.unshift({
                categoryId: element.tourCategoryId,
                categoryName: element.label,
                disableCategory: true,
                accomodations: accomodation,
              });
            }
          });

          accomodation = [];
          let turistaBaja = baja.filter(
            (categories) => categories.label == "Turista"
          );
          turistaBaja.forEach((element, index) => {
            accomodation.push({
              accommodationId: element.roomTypeId,
              chooseProvider: element.roomTypeNameEnglish,
              price: element.price,
            });
            if (index == 1) {
              categories.push({
                categoryId: element.tourCategoryId,
                categoryName: element.label,
                disableCategory: true,
                accomodations: accomodation,
              });
              this.seasons.push({
                seasonId: element.tourSeasonId,
                label: element.tourSeasonName,
                tourId: element.tourId,
                status: true,
                changeName: true,
                priority: element.priority,
                applyToTourParent: false,
                categories: categories,
              });
            }
          }); */

          console.log(this.seasons);
        })
        .catch((error) => {
          this.status = "error";
          console.error(error.response);
        });
    },
    /* Cuando el Tour no tiene temporadas configuradas */
    getSeasonDefault() {
      axios
        .get(this.url + "TourSeason")
        .then((response) => {
          /* this.aAccommodation = response.data; */

          response.data.forEach((season, index) => {
            if (season.isdefault) {
              if (index == 0) {
                this.categoryDefault = season.name;
              }
              this.seasons.push({
                seasonId: season.id,
                label: season.name,
                tourId: this.listTours.id,
                status: true,
                changeName: true,
                priority: index == 0 ? true : false,
                applyToTourParent: false,
                categories: [],
              });
            }
          });
          console.log(this.seasons);
          this.AddSeasonsCategories();
        })

        .catch((error) => {
          this.status = "error";
          console.error(error.response);
        });
    },
    postSeason() {
      /* this.activeName = "second";
      this.caculateDate(this.listTours); */
        if (this.getSeasons.length == 0) {
        axios
          .post(
            this.url + "TourCategorySeason/AddHappyTourSeasson",
            this.seasons
          )
          .then((response) => {
            console.log(response);

            this.$notify({
              title: i18n.t("notifications.success"),
              message: i18n.t("notifications.hotelAddedSuccess"),
              type: "success",
              duration: 2000,
            });
            this.activeName = "second";
            this.getSeason();
            this.caculateDate(this.listTours);
          })
          .catch((error) => {
            console.error(error.response);
          });
      }
      console.log(this.seasons);
      this.caculateDate(this.listTours);
      this.activeName = "second";
      this.dialogFormVisible = false;
    },
    handleSelect(item) {
      this.seasons = [];
      /* this.getSeasonDefault(); */
      this.tour = item.name;
      this.tourSelected = 52;
      this.listTours = item;
      /* para listar los tours hijos */
      this.listLoading = false;
      this.getAccommodation();
      this.name_categories = this.listTours.tourCategories
        .map((u) => u.providerCategoryName)
        .join(", ");
      this.getSeason();
      console.log("Season", this.seasons);
    },
    //----END METHODS FOR SEASON TAB----//

    /* TABLE */
    getList() {
      this.listLoading = true;
      fetchList(this.listQuery).then((response) => {
        this.total = response.data.total;

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 1000);
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
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
      this.$confirm("Are you sure to close this form?")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
    handleDownload() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = ["id", "nameEnglish", "nameEspanish"];
        const filterVal = ["id", "name", "nameEspanish"];
        const data = this.formatJson(filterVal);
        const date = new Date();
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "RoomType" + date,
        });
        this.downloadLoading = false;
      });
    },
    resetTemp() {
      this.formTour = {
        name: "",
        duration_in_days: 0,
        status: true,
        idProvider: "",
        providerName: "",
        hotel_category: [],
        options: [],
      };
      this.fileUploads = [];
      this.formDayDetail = [];
    },
    /* POST */
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
    },
    postTourInstance() {
      console.log(this.checkedTours);
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
        tourInstances: this.aListToursFinal,
      };

      axios
        .post(this.url + "Tour/AddTourInstanceFromTour", tour)
        .then((response) => {
          this.dialogFormVisible = false;
          this.$notify({
            title: "Success",
            message: "Las instancias fueron creadas con exito",
            type: "success",
            duration: 2000,
          });
          this.getTourbyId(this.listTours);
          this.activeName = "second";
        })
        .catch((error) => {
          console.error(error.response);
        });
    },
    /* UPDATE */
    handleUpdate(row) {
      console.log(row);
      this.resetTemp();
      this.editFormTourDayDescription = [];
      this.active = 0;
      this.tourUpdate = row;
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.formTour.name = row.name;
      this.formTour.duration_in_days = row.duration_in_days;
      this.formTour.status = row.status;
      this.formTour.idProvider = row.idProvider;
      this.formTour.providerName = row.providerName;
      this.editFormTourDayDescription = row.tourDayDescriptions;
      this.formImageTour.idTour = row.id;
      this.editTourDayDescription = true;
      this.start_date = new Date(row.tourDayDescriptions[0].startTime);
      row.tourCategories.forEach((element, index) => {
        console.log(element);
        this.formTour.hotel_category[index] = element.providerCategoryId;
        this.aTourCategory[index] = element.id;
      });
      this.editFormTourDayDescription.forEach((element, index) => {
        this.getImageByIdDay(element);
      });
      console.log(this.aTourCategory, this.formDayDetail);
      this.getCatProv();
    },
    updateData() {
      if (this.active == 0) {
        this.calculateDays();
        this.next();
        this.calculateDays();
      } else if (this.active == 1) {
        var tour = {
          name: this.formTour.name,
          duration_in_days: this.formTour.duration_in_days,
          status: this.formTour.status,
          idProvider: this.formTour.idProvider,
          id: this.tourUpdate.id,
          tourCategories: [],
          tourDayDescriptions: [],
        };
        this.formDayDetail.forEach((element, index) => {
          console.log(element);
          var dayDescription = {
            id: element.id,
            dayNumber: index + 1,
            matchable: element.matchable,
            tourCities: element.titleTourCities,
            startTime: new Date(this.start_date),
            dayDescriptionEnglish: element.description_english,
            dayDescriptionSpanish: element.description_spanish,
            tourId: element.tourId,
            cityId: element.cityId,
          };
          tour.tourDayDescriptions.push(dayDescription);
        });
        this.formTour.hotel_category.forEach((option, index) => {
          console.log(option);
          var tourCategory = {
            tourId: this.tourUpdate.id,
            providerCategoryId: option,
            id: this.aTourCategory[index],
          };
          tour.tourCategories.push(tourCategory);
        });
        console.log(tour);
        axios
          .put(this.url + "Tour", tour)
          .then((response) => {
            console.log(response.data[0]);
            this.postImageTour(response.data[0].tourDayDescriptions);
            this.getTourbyId(this.listTours);
          })
          .catch((error) => {
            console.error(error.response);
          });
        this.dialogFormVisible = false;
        console.log("esto", this.formDayDetail);
      }
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
          var tour = {
            id: data.id,
            name: data.name,
            duration_in_days: data.duration_in_days,
            status: status,
            idProvider: data.idProvider,
          };
          axios
            .put(this.url + "Tour", tour)
            .then((response) => {
              this.dialogFormVisible = false;
              this.$notify({
                title: "Success",
                message: "Status changed Successfully",
                type: "success",
                duration: 2000,
              });
              this.getProvider();
            })
            .catch((error) => {
              console.error(error);
            });
        })
        .catch(() => {
          this.getTourGeneral();
        });
    },
    next() {
      if (this.active++ > 2) this.active = 0;
    },
    /* GET */
    /* para el select */
    getTour(queryString, cb) {
      axios
        .get(this.url + "Tour")
        .then((response) => {
          console.log(response.data);
          /* para que el autocomplete solo muestre los tours padres */
          var links = response.data;
          var aTours = [];
          this.list = response.data;
          aTours = response.data.map((item) => {
            console.log(item.isMaster);
            return item.isMaster ? item : 1;
          });
          console.log("me actualicé", this.list);
          links = aTours.filter((element) => element !== 1);
          var results = queryString
            ? links.filter(this.createFiltertourDay(queryString))
            : links;
          cb(results);
        })

        .catch((error) => {
          this.status = "error";
          console.error(error.response);
        });
    },
    createFiltertourDay(queryString) {
      console.log(queryString);
      return (link) => {
        return link.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
      };
    },
    /* para la tabla */
    getTourForTable() {
      axios
        .get(this.url + "Tour")
        .then((response) => {
          console.log(response.data);
          /* para que el autocomplete solo muestre los tours padres */
          var aTours = [];
          this.list = response.data;
          aTours = response.data.map((item) => {
            console.log(item.isMaster);
            return item.isMaster ? item : 1;
          });
          this.orderList();
          console.log("me actualicé", this.list);
        })

        .catch((error) => {
          this.status = "error";
          console.error(error.response);
        });
    },
    /* Para actualizar la el tour actual */
    getTourbyId(tour) {
      axios
        .get(this.url + "Tour/GetTourById?id=" + tour.id)
        .then((response) => {
          this.listTours = response.data[0];
          console.log(this.listTours);
          this.getTourForTable();
          this.caculateDate(this.listTours);
        })

        .catch((error) => {
          this.status = "error";
          console.error(error.response);
        });
    },
    handleIconClick(ev) {
      console.log(ev);
    },
    handleCheckAllChange(val) {
      console.log(val);
      val
        ? (this.checkedTours = this.aListTours)
        : this.checkTour(this.listTours);
      this.isIndeterminate = false;
    },
    handlecheckedToursChange(value) {
      this.aListToursFinal = [];
      var copyValue = value;
      console.log(value, this.aListTours);
      /* CONVIRTIENDO ARRAY DE STRING EN ARRAY DE OBJETS  */
      value.forEach((element, index) => {
        this.aListTours.forEach((element2, index) => {
          if (element === element2.nameInstance) {
            this.aListToursFinal.push({
              tourId: element2.tourId,
              nameInstance: element2.nameInstance,
              startDate: element2.startDate,
            });
          }
        });
      });
      if (this.listTours.tourInstances.length > 0) {
        this.listTours.tourInstances.forEach((element, index) => {
          console.log(element);
          this.aListToursFinal.forEach((element2, index2) => {
            if (element2.nameInstance === element.nameInstance) {
              this.aListToursFinal.splice(index2, 1);
            }
          });
        });
      }
      console.log(this.aListToursFinal);
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.aListTours.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.aListTours.length;
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    caculateDate(tour) {
      let date = new Date(tour.tourDayDescriptions[0].startTime);
      this.aListTours = [];
      for (let index = 0; index < 52; index++) {
        this.aListTours.push({
          tourId: tour.id,
          nameInstance: index + 1 + ". " + tour.name,
          startDate: new Date(date.setDate(date.getDate() + 7)),
          disabled: false,
          seasonName: this.categoryDefault,
          seasonId: this.categoryIdDefault,
        });
      }
      this.checkTour(tour);
      this.orderList();
      this.aListToursFinal = this.aListTours;
      console.log(this.aListTours, this.checkedTours);
      console.log("entré", this.aListTours);
    },
    checkTour(tour) {
      this.checkedTours = [];
      if (tour.tourInstances.length == 0) {
        this.aListTours.forEach((element, index) => {
          console.log("hola");
          this.checkedTours.push(element.nameInstance);
        });
        console.log(this.aListTours, this.checkedTours);
      } else {
        console.log("entré aqui");
        tour.tourInstances.forEach((element, index) => {
          this.checkedTours.push(element.nameInstance);
          this.aListTours.forEach((element2, index) => {
            if (element2.nameInstance == element.nameInstance) {
              element2.disabled = true;
            }
          });
        });
      }
    },
    orderList() {
      var aTourChildren = [];
      aTourChildren = this.list.map((item) => {
        return item.masterTourId === this.listTours.id ? item : 1;
      });
      console.log("fecha", this.list);
      this.list = aTourChildren
        .filter((element) => element !== 1 && !element.isMaster)
        .slice()
        .sort((a, b) => {
          let dateA = new Date(a.tourDayDescriptions[0].startTime);
          let dateB = new Date(b.tourDayDescriptions[0].startTime);
          return dateA - dateB;
        });
      console.log("fecha 2", this.list);
    },
    getCatProv() {
      axios
        .get(
          this.url +
            "ProviderCategories/GetProviderCategoriesbyIdProvider?id=" +
            this.formTour.idProvider
        )
        .then((response) => {
          console.log(response.data);
          this.formTour.options = response.data;
        })
        .catch((error) => {
          this.status = "error";
          console.log(error.response);
        });
    },
    getProviders(queryString, cb) {
      axios
        .get(this.url + "Provider/GetProviderWithCategories")
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
    handleSelectProv(item) {
      this.formTour.providerName = item.name;
      this.formTour.idProvider = item.id;
      this.getCatProv();
    },
    handleIconClickProv(ev) {
      console.log(ev);
    },
    /* DELETE */
    handleSelectionChange(val) {
      this.aTourList = val;
    },
    handleDelete(row, selected) {
      var id = selected ? row : row.id;
      axios
        .delete(this.url + "Tour/" + id)
        .then((response) => {
          this.$notify({
            title: "Success",
            message: "Delete Successfully",
            type: "success",
            duration: 2000,
          });
          this.showReviewer = false;
          this.deleteTourInstance(id);
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
          console.log(row);
          this.handleDelete(row, false);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "Delete canceled",
          });
        });
    },
    handleDeleteAll() {
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
          this.aTourList.forEach((value) => {
            console.log("hola", value);
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
    deleteTourInstance(id) {
      this.listTours.tourInstances.forEach((element, index) => {
        if (element.tourhijo == id) {
          axios
            .delete(this.url + "TourInstance/" + element.id)
            .then((response) => {
              this.$notify({
                title: "Success",
                message: "Delete Successfully",
                type: "success",
                duration: 2000,
              });
              this.showReviewer = false;
              this.getTourbyId(this.listTours);
            })
            .catch((error) => {
              console.error(error.response);
            });
        }
      });
    },
    /* IMAGE */
    handleRemove(file, fileList) {
      console.log(file, fileList);
      if (this.dialogStatus == "update") {
        axios
          .delete(
            this.url + "TourDayMediaImage/DeleteTourDayMedia?id=" + file.id
          )
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
      }
    },
    uploadFile(file) {
      console.log(this.formDayDetail, this.arrayPosition, file);

      this.formDayDetail[this.arrayPosition].images.push(file);
    },
    getImageByIdDay(day) {
      console.log(day);
      axios
        .get(this.url + "TourDayMediaImage/GetAllByTourDay?tourday=" + day.id)
        .then((response) => {
          console.log(response.data);
          day.images = response.data;
        })
        .catch((error) => {
          this.status = "error";
        });
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg" || file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG) {
        this.$message.error("La imagen debe estar en formato JPG!");
      }
      if (!isLt2M) {
        this.$message.error("La imagen excede los 2MB!");
      }

      return isJPG && isLt2M;
    },
    handleChange(val) {
      console.log(val);
    },
    /* CITY */
    getCities(queryString, cb) {
      axios
        .get(this.url + "City")
        .then((response) => {
          console.log(response.data);
          var links = response.data;
          var results = queryString
            ? links.filter(this.createFilterCity(queryString))
            : links;
          cb(results);
        })
        .catch((error) => {
          this.status = "error";
          console.error(error.response);
        });
    },
    createFilterCity(queryString) {
      return (link) => {
        return (
          link.nameEnglish.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        );
      };
    },
    handleSelectCity(item) {
      console.log(item, this.arrayPosition + 1, this.formDayDetail.length);
      this.formDayDetail[this.arrayPosition].cityName = item.nameEnglish;
      this.formDayDetail[this.arrayPosition].cityId = item.id;
      if (this.arrayPosition + 1 < this.formDayDetail.length) {
        this.formDayDetail[this.arrayPosition + 1].tourCities.unshift(
          item.nameEnglish.split(",")[0]
        );
      }
      this.formDayDetail[this.arrayPosition].titleTourCities =
        this.concatenateTitle(this.arrayPosition);
    },
    /* TOURDAY */
    calculateDays() {
      console.log("entre a calcular");
      let days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      console.log(this.start_date);
      const copyStartDate = new Date(this.start_date);
      this.formDayDetail = [];
      var weekDay = 0;
      var countDays = 0;
      const dateFormat =
        this.start_date.getDate() +
        "/" +
        (this.start_date.getMonth() + 1) +
        "/" +
        this.start_date.getFullYear();
      for (
        let index = 0;
        index < parseInt(this.formTour.duration_in_days);
        index++
      ) {
        weekDay = copyStartDate.getDay();
        if (!this.editTourDayDescription) {
          var day = {
            dayName: "Day " + (index + 1) + " - ",
            dayName2: days[weekDay],
            startDate: this.addDate(index, dateFormat) + " - ",
            startDateFormat: new Date(this.start_date),
            cityName: "",
            cityId: 0,
            description_english: "",
            description_spanish: "",
            tourCities: [],
            titleTourCities: "",
            matchable: false,
            images: [],
          };
          this.formDayDetail.push(day);
        } else {
          /* this.start_date = this.editFormTourDayDescription[index].startTime; */
          console.log("esto", this.editFormTourDayDescription, index);
          if (index + 1 <= this.editFormTourDayDescription.length) {
            var day = {
              dayName: "Day " + (index + 1) + " - ",
              dayName2: days[weekDay],
              startDate: this.addDate(index, dateFormat) + " - ",
              startDateFormat: new Date(this.start_date),
              cityName:
                this.editFormTourDayDescription[index]["cityNameEnglish"],
              cityId: this.editFormTourDayDescription[index]["cityId"],
              description_english:
                this.editFormTourDayDescription[index]["dayDescriptionEnglish"],
              description_spanish:
                this.editFormTourDayDescription[index]["dayDescriptionSpanish"],
              matchable: this.editFormTourDayDescription[index]["matchable"],
              id: this.editFormTourDayDescription[index]["id"],
              tourCities:
                this.editFormTourDayDescription[index]["tourCities"].split("/"),
              titleTourCities:
                this.editFormTourDayDescription[index]["tourCities"],
              tourId: this.editFormTourDayDescription[index]["tourId"],
              images: this.editFormTourDayDescription[index]["images"],
            };
          } else {
            var day = {
              dayName: "Day " + (index + 1) + " - ",
              dayName2: days[weekDay],
              startDate: this.addDate(index, dateFormat) + " - ",
              startDateFormat: new Date(this.start_date),
              cityName: "",
              cityId: 0,
              description_english: "",
              description_spanish: "",
              tourCities: [],
              titleTourCities: "",
              matchable: false,
              images: [],
            };
          }
          console.log(this.formDayDetail, this.editFormTourDayDescription);
          this.formDayDetail.push(day);
        }
        copyStartDate.setDate(copyStartDate.getDate() + 1);
      }
    },
    addDate(d, fecha) {
      var months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      var Fecha = new Date();
      var sFecha =
        fecha ||
        Fecha.getDate() +
          "/" +
          (Fecha.getMonth() + 1) +
          "/" +
          Fecha.getFullYear();
      var sep = sFecha.indexOf("/") !== -1 ? "/" : "-";
      var aFecha = sFecha.split(sep);
      var fecha = aFecha[2] + "/" + aFecha[1] + "/" + aFecha[0];
      fecha = new Date(fecha);
      fecha.setDate(fecha.getDate() + parseInt(d));
      var anno = fecha.getFullYear();
      var mes = months[fecha.getMonth()];
      var dia = fecha.getDate();
      mes = mes < 10 ? "0" + mes : mes;
      dia = dia < 10 ? "0" + dia : dia;
      var fechaFinal = dia + sep + mes + sep + anno;
      console.log(fechaFinal);
      return fechaFinal;
    },
    handleClose(done) {
      this.$confirm("Are you sure to close this form?")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
    addTourCities(index) {
      this.formDayDetail[index].tourCities.push(this.sCity);
      this.formDayDetail[index].titleTourCities = this.concatenateTitle(index);
      this.sCity = "";
    },
    deleteTourCities(index, element) {
      this.formDayDetail[index].tourCities.splice(element, 1);
      this.formDayDetail[index].titleTourCities = this.concatenateTitle(index);
    },
    concatenateTitle(index) {
      let result = "";

      this.formDayDetail[index].tourCities.length == 2 &&
      this.formDayDetail[index].tourCities[0] ===
        this.formDayDetail[index].tourCities[1]
        ? this.formDayDetail[index].tourCities.pop
        : "";
      this.formDayDetail[index].tourCities.forEach((element) => {
        result = result.concat(element) + "/";
      });

      result = result.concat(this.formDayDetail[index].cityName.split(",")[0]);
      return result;
    },
    changeArrayPositions(array, x, y) {
      [array[x], array[y]] = [array[y], array[x]];
    },
    itemSelected(item) {
      console.log("seleccionar", item, this.aListTours);
    },
    /* INPUT SEARCH */
  },
};
</script>
<style lang="scss">
@media (max-width: 600px) {
  .el-dialog {
    width: 100% !important;
  }
}
.space {
  margin: 3px;
  width: 350px;
}
.el-checkbox.is-bordered + .el-checkbox.is-bordered {
  margin: 3px !important;
}
.card-form-item {
  width: 45%;
}
.card-form-container {
  display: flex;
}
.categoty-name {
  margin-bottom: 1rem;
  margin-top: 1.5rem;
  font-weight: 400;
  font-size: 1rem;
  font-weight: 600;
  color: rgb(88, 88, 88);
}
.box-card-container {
  margin: 1.3rem 0;
}
.card-checkbox-container {
  margin-top: 1rem;
}
.card-checkbox-container .el-checkbox__label {
  font-size: 0.76rem;
}

.add-card {
  display: flex;
  justify-content: center;
  align-items: center;
}
.card-name {
  display: flex;
  max-width: 60%;
  box-sizing: border-box;
  border-radius: 5px;
  transition: 0.2s ease;
  border: 1px solid transparent;
}
.card-name:hover,
.card-name-onfocus {
  border-color: #e6e6e6;
  -webkit-box-shadow: -1px 3px 12px 2px rgba(173, 173, 173, 0.2);
  box-shadow: -1px 3px 12px 2px rgba(173, 173, 173, 0.2);
  transform: translateY(-5px);
}

.card-name input {
  display: inline-block;
  padding: 0 0.4rem;
  flex-basis: 1;
  font-weight: bold;
  color: rgb(31, 31, 31);
  font-size: 1.05rem;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-color: transparent;
}

.card-name input:read-only {
  flex-basis: 0;
  font-weight: bold;
  color: rgb(31, 31, 31);
  font-size: 1.05rem;
}

.card-name button {
  opacity: 0;
  display: flex;
  justify-content: center;
  width: 50px;
}

.card-name:hover button,
.card-name-onfocus button {
  opacity: 1;
}

.card-name-onfocus button {
  background: #455ba0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.card-name-onfocus button i {
  color: #fff;
}

.delete-card-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 0.5rem;
}
.header-checkbox {
  font-size: 0.8rem;
}
.box-card-header {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}
.card-checkbox-container {
  width: 100%;
  margin-bottom: 1rem;
}
.el-card__body {
  height: 600px;
  overflow-y: auto;
}
.el-card__body::-webkit-scrollbar {
  box-sizing: border-box;
  width: 15px;
  border: 5px solid #fff;
}
.el-card__body::-webkit-scrollbar-thumb {
  background: rgb(240, 240, 240);
  border: 5px solid #fff;
  border-radius: 20px;
}
.add-card {
  height: 732px;
  width: 100%;

  display: flex;
  justify-content: center;
  align-content: center;
  background-color: #f7f7f7;
  border-radius: 5px;
  border: 1px solid #e9e9e9;

  -webkit-box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}
.add-card-button {
  width: 50px;
  height: 50px;
  -webkit-box-shadow: -1px 3px 12px 2px rgba(173, 173, 173, 0.82);
  box-shadow: -1px 3px 12px 2px rgba(173, 173, 173, 0.82);
}
</style>