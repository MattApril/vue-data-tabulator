<template>
    <table :class="tableClass">
        <thead>
        <tr>
            <!-- TODO: needs slot to customize heading..? would be useful for any stacked headings we might want to apply -->
            <th v-for="heading in reportHeadings" :class="getHeadingClasses(heading)" @click="sortBy(heading)">
                {{heading}}
            </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="row in reportData">
            <td v-for="(value, colName) in getMappedRow(row)" :class="[textToCssClass(colName), colName == currentSortColumn ? 'sorted' : '']">
                <slot :name="colName" :default-value="value" :row="row">
                    {{value}}
                </slot>
            </td>
        </tr>
        </tbody>
    </table>
</template>

<script>
    export default {

        props: {
            data: {
                type: Array,
                required: true
            },
            columnOverride: {
                type: Object,
                required: false,
                default: function(){
                    return {}
                },
            },
            disableSorting: {
                type: Boolean,
                required: false,
                default: false
            },
            sortable: {
                type: Array,
                required: false,
                default: function(){
                    return [];
                },
            },
            tableClass: {
                required: false,
                default: 'table'
            },
            defaultSorter: {
                type: Function,
                required: false,
                default: function(rowA, rowB, valA, valB) {
                    if( valA > valB ){
                        return 1;
                    }else if( valA < valB ){
                        return -1;
                    }
                    return 0;
                }
            },
            sortValues: {
                type: Object,
                required: false,
                default: function() {
                    return {};
                }
            },
            customSorters: {
                type: Object,
                required: false,
                default: function(){
                    return {};
                }
            }
        },

        data: function(){
            return {
                reportHeadings: [],
                reportData: [],
                currentSortColumn: null,
                currentSortDirection: 1,
            };
        },

        computed: {
            isCustomLayout: function() {
                return Object.keys(this.columnOverride).length > 0;
            }
        },

        created: function() {
            this.reportData = this.data;
            this.syncHeadings();
        },

        watch: {
            data: function( data ) {
                // if there is no column layout specified we need to generate the headings based on the given data,
                // so make sure we update the headings if the data changes
                if( !this.isCustomLayout ) {
                    this.reportHeadings = this.getHeadingsFromData( data );
                }
                // TODO: if new data is loaded we should sort it the same way old data was sorted.
                this.reportData = this.data;
            },

            columnOverride: function() {
                this.syncHeadings();
            }
        },

        methods: {

            /**
             * Synchronize headings with current data/columnOverride props
             */
            syncHeadings: function() {
                if( this.isCustomLayout ) {
                    this.reportHeadings = Object.keys( this.columnOverride );
                } else {
                    this.reportHeadings = this.getHeadingsFromData( this.data );
                }
            },

            /**
             * Gets default headings for a given full data set
             *
             * @param data array of data
             * @returns {Array}
             */
            getHeadingsFromData: function( data ) {
                // if no column definition is provided we will use the keys of the first element in the data set to construct the headings
                return this.getHeadingsFromRawKeys(data[0] || {});
            },

            /**
             * Generates default headings based on data keys
             *
             * @param object
             * @returns {Array}
             */
            getHeadingsFromRawKeys: function( object ) {
                return Object.keys(object).map( this.keyToHeading );
            },

            /**
             * Convert a key to a heading
             * @return string
             */
            keyToHeading: function( key ) {
                // TODO: replace underscores for spaces
                // capitalize..
                // NOTE: always keep headingToKey updated if modifying
                return key.charAt(0).toUpperCase() + key.slice(1)
            },

            /**
             * Convert a heading to a key value (reverse keyToHeading)
             * @return string
             */
            headingToKey: function( heading ) {
                return heading.charAt(0).toLowerCase() + heading.slice(1)
            },

            /**
             * For a given record (row) in table, map out the data based on a given column map.
             *
             * @param rawRecord
             * @param columnMap
             * @returns {{}}
             */
            applyOverrideToRecord: function(rawRecord, columnMap) {
                var mappedRecord = {};
                for (var colName in columnMap) {
                    if (columnMap.hasOwnProperty(colName)) {
                        // this is the value the user has defined for this column
                        // typically this will be a string value that maps to a property in the row record (dot notation supported)
                        var mappedProperty = columnMap[colName];
                        // if it is a string attempt to get the value now
                        if( typeof mappedProperty == 'string' ) {
                            var mappedValue = this.getObjectValue(rawRecord, mappedProperty);
                        }

                        if( mappedValue !== undefined ) {
                            // return the mapped property for this column
                            mappedRecord[colName] = mappedValue;
                        } else {
                            // if its not defined then the user has hard-coded some value (i.e. null) that they likely intend on replacing with a slot, so we can just return the value directly
                            mappedRecord[colName] = mappedProperty;
                        }
                    }
                }
                return mappedRecord;
            },

            /**
             * Determines what columns and data we are using for a given row
             *
             * @param rawRow
             * @returns {*}
             */
            getMappedRow: function( rawRow ) {
                // are we using the raw row, or applying a column override?
                if( Object.keys(this.columnOverride).length === 0 ) {
                    return rawRow;
                } else {
                    return this.applyOverrideToRecord( rawRow, this.columnOverride );
                }
            },

            /**
             * for a given column name, determine the row property it should map to.
             * Note, this may not be a valid property for custom layouts, as the user can map to anything they want (null, hardcoded string, etc.)
             */
            getUnderlyingHeadingProperty: function( headingName ) {
                if( this.isCustomLayout ) {
                    return this.columnOverride[headingName];
                } else {
                    return this.headingToKey( headingName );
                }
            },

            /**
             * Determines if a given column is sortable in the present state of props
             * @return boolean
             */
            isSortable: function( column ) {
                // disableSorting takes precedence
                if( this.disableSorting ) return false;

                // if sortable columns are specified then the column must be listed
                if( this.sortable.length ) {
                    return this.sortable.indexOf(column) !== -1;
                }

                // if no sorting rules are specified we will automatically decide what is sortable and what is not, based on given props
                if( this.isCustomLayout ) {
                    // if a custom layout is specified then only columns that map to actual properties should be sorted.
                    // if the column mapping is something other than a string we expect the user is likely using a slot to insert custom values,
                    // in which case they will need a custom sort function to handle it.

                    if( this.sortValues[column] ) {
                        // if a custom sort value is provided then the column is sortable.
                        return true;

                    } else if( typeof this.columnOverride[column] == 'string' ) {
                        // if the column override maps to a string then it means the user has specified a property it should map to.
                        return true;
                    }

                } else {
                    return true;
                }

                // if no other condition is met then the column is not sortable.
                return false;
            },

            /**
             * Sorts the data by a given column.
             * @param column string text name of the column to sort by
             */
            sortBy: function( column ) {

                if( !this.isSortable(column) ) return;

                if( column == this.currentSortColumn ) {
                    // if we are re-sorting the same column that we already sorted by then reverse the direction
                    this.currentSortDirection *= -1;
                } else {
                    // otherwise set the current sort column and reset the direction to the default value
                    this.currentSortColumn = column;
                    this.currentSortDirection = 1;
                }

                // need to map column name back to the underlying property
                var underlyingProp = this.getUnderlyingHeadingProperty( column );

                // determine which sort function to use for the given column
                var sorterFunction = null;
                if( this.customSorters[column] ) {
                    sorterFunction = this.customSorters[column];
                } else {
                    sorterFunction = this.defaultSorter;
                }

                // apply sorting
                var vm = this;
                this.reportData.sort(function (row1, row2) {
                    // if we have a custom sortValue defined for this column then use that function to determine the row1Value and row2Value
                    var row1Value;
                    var row2Value;

                    // determine the value we should be sorting this column on..
                    if( vm.sortValues[column] ) {
                        // if a custom sort value function is provided for this column we will use it.
                        row1Value = vm.sortValues[column](row1);
                        row2Value = vm.sortValues[column](row2);

                    } else if( typeof underlyingProp === 'string' ) {
                        // otherwise use the underlying prop for this column (may not map to anything, in which case undefined will be returned)
                        row1Value = vm.getObjectValue(row1, underlyingProp);
                        row2Value = vm.getObjectValue(row2, underlyingProp);

                    } else {
                        // if no sortValue defained, and the underlying prop is not a string, row1Value and row2Vlaue can remain undefined
                        // a custom sort function is likely being used..
                    }

                    // apply our sort function callback now (this will either be a user provided function, or a our defaultSorter function )
                    return sorterFunction(row1, row2, row1Value, row2Value) * vm.currentSortDirection;
                })
            },

            /**
             * Gets an object property, supports dot notation for nested objects
             */
            getObjectValue: function( object, prop ) {
                function index(obj,i) {return obj[i]}
                return prop.split('.').reduce(index, object)
            },

            /**
             * Gets css class name for a given piece of text
             *
             * @param text
             * @returns {string}
             */
            textToCssClass: function( text ) {
                return text.replace(/\s+/g, '-').toLowerCase();
            },

            /**
             * Determine css class bindings for a given heading
             * @param heading
             * @returns {Array}
             */
            getHeadingClasses: function( heading ) {
                var classes = [this.textToCssClass(heading)];

                if( this.isSortable(heading) ) {
                    classes.push('sortable');
                }

                if( this.currentSortColumn == heading ) {
                    classes.push('sorted');
                    if( this.currentSortDirection == -1 ) {
                        classes.push('asc');
                    } else {
                        classes.push('desc');
                    }
                }
                return classes;
            }

        },
    }
</script>

<style scoped>
    table > thead > tr > th,
    table > tbody > tr > td {
        padding: 6px 12px;
    }

    th.sortable {
        position: relative;
        cursor: pointer;
    }

    th.sortable::after {
        content: "\2195";
        position: absolute;
        left: 2px;
        color: #AAA;
    }

    th.sorted.asc::after {
        content: "\2191";
        color: #337ab7;
    }
    th.sorted.desc::after {
        content: "\2193";
        color: #337ab7;
    }
    tr .sorted {
        background-color: #F5F5F5;
    }
</style>
