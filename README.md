# data-tabulator
This is a light weight and customizable data table component for Vue2 and Vue3 projects. Primary Features:

* Renders data sets as html table
* Easily supports nested data structures with dot-notation
* Easy content customization with per-column slots
* Column sorting (highly customizable)

Note that only minimal CSS is provided at the moment. You will want to provide your own styles via the table-class prop.


## Installation
#### Via NPM
**Vue 3**
```
npm install vue-data-tabulator
```
**Vue 2**
```
npm install vue-data-tabulator@^0.2.4
```

#### Direct script usage
```
<script src="https://unpkg.com/vue"></script>
<!-- comes after Vue -->
<script src="https://unpkg.com/vue-data-tabulator"></script>
```


#### Adding the component to your project
Global install
```
import DataTabulator from 'vue-data-tabulator'
Vue.use(DataTabulator)
```

Options API:
```
import { DataTabulator } from 'vue-data-tabulator'
{
    component: {DataTabulator}
}
```

## Basic usage

CSS - optional basic styling to get you started.
See also: "table-class" prop
```
// in a Single File Component you may add:
<style src="vue-data-tabulator/dist/vue-data-tabulator.css"></style>
```

Component usage:
```
<data-tabulator
    :data="myData"
    table-class="my-table-css-class">
</data-tabulator>
```
The table-class prop can be used for table styling. For example, if you are using bootstrap, this could be "table table-hover"

## Custom Layouts

#### Customizing table cells via slots
The simplest way to customize your table is using slots to modify the markup of the table:
```
myData = [
    {id: 1, first: 'Matt', last: 'April', is_cool: true},
    {id: 1, first: 'John', last: 'Doe', is_cool: false},
];
```

Here we will convert boolean values to text for each row in the table
Inside the data-tabulator component we will define a slot for the "Is_cool" column. 
Note that by default data-tabulator capitalizes all column names, and the slot references the case-sensitive title of the column, not the property name.
So slot="Is_cool" (not is_cool). More on this below..
```
<data-tabulator
    :data="myData">
    
    <template slot="Is_cool" slot-scope="{row}">
        {{row.is_cool ? 'Awe Ye' : 'Heck Naw'}}    
    </template>
    
</data-tabulator>
```

#### Custom column definitions
By default the columns names of your table will match each property in your array of data, with the first letter capitalized. 
For example, in the myData array above, the columns would be: Id, First, Last, Is_cool.
If we want the table to simple have two columns: "Name" (combination of first and last) and "Cool?", we can provide a column-override definition via props.

 
 ```
 columns = {
    'Name': null, //set this as null because we will populate with a custom value via slots.
    'Cool?': 'is_cool' // maps is_cool property to a column titled "Cool?"
 }
 ```

To populate the "Name" column we can create a template for it, referencing the title of the column we provided. 
Now each row in this column will display the first and last names.
```
<data-tabulator
    :data="myData"
    :column-override="columns">
    
    <!-- Here we define the data displayed in "Name" column -->
    <template slot="Name" slot-scope="{row}">
        {{row.first}} {{row.last}}    
    </template>
    
</data-tabulator>
```

#### Nested data structures
Data-tabulator also supports nested data structures. 
This can be a very useful to avoid re-structuring your data just to display it. Lets run through an example:

```
myData = [
    {id: 1, first: 'Matt', last: 'April', is_cool: true, employer: {
            company: 'My Space',
            since: '2001-01-01'
        }
    },
    {id: 1, first: 'John', last: 'Doe', is_cool: false, employer: {
            company: 'ACME',
            since: '2015-01-01'
        }
    },
];
```

 ```
 columns = {
    'First': 'first',
    'Last': 'last',
    'Employer': 'employer.name' // Creates a column "Employer" that maps to the "company" property on the employer object.
 }
 ```
 Note: the columns object would be set as the column-override prop on your component.


#### Optional props
* `table-class` (String|Array|Object): set class element on the <table> (useful for applying styles)
* `disable-sorting` (Bool): turns off all sorting  
* `sortable` (Array): specifies which columns should be sortable (use column title exactly as it displays in table)
* `default-sort-column` (String): name of column to sort by default
* `sort-values` (Object): An object of functions, keyed on column name. Used to define the value a given column should be sorted on. useful when working with custom columns.
* `default-sorter` (Function): default sort compare function used.
* `custom-sorters` (Object): custom sort functions per column, keyed on column name (as displayed in table)
