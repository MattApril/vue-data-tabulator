# data-tabulator

## Project setup
#### Via NPM
```
npm install vue-data-tabulator
```

#### Direct script usage
```
<script src="https://unpkg.com/vue"></script>
<!-- comes after Vue -->
<script src="https://unpkg.com/vue-data-tabulator"></script>
```

## Basic usage
```
import DataTabulator from 'vue-data-tabulator'
```


```
// global install
Vue.use(DataTabulator)

// or inside another component:
{
    component: {DataTabulator}
}
```

CSS - optional basic styling to get you started.
See also: "table-class" prop
```
<style src="vue-data-tabulator/dist/vue-data-tabulator.css"></style>
```

In template:
```
<data-tabulator
    :data="myData">
</data-tabulator>
```

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
Inside the data-tabulator component we will define a slot for the "Is Cool" column. Note that is uses the human readable column name, not the property name (more on this later).
```
<data-tabulator
    :data="myData">
    
    <template slot="Is Cool" slot-scope="{row}">
        {{row.is_cool ? 'Awe Ye' : 'Heck Naw'}}    
    </template>
    
</data-tabulator>
```

#### Custom column definitions
By default the columns of your table will match each property in your array of data. For example, in the myData array above, the columns would be: Id, First, Last, Is Cool.
If we want this to simply be: "Name" and "Is Cool", we can provide a column-override definition via props.
 
 ```
 columns = {
    'Name': null,
    'Is Cool': 'is_cool'
 }
 ```

And now we can access that columns slot by name and insert both the first and last names in each row of that column.
```
<data-tabulator
    :data="myData"
    :column-override="columns">
    
    <template slot="Name" slot-scope="{row}">
        {{row.first}} {{row.last}}    
    </template>
    
</data-tabulator>
```

#### Nested data structures
TODO

#### Other props
TODO
