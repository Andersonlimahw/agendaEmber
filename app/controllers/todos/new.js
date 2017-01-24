import Ember from 'ember';

export default Ember.Controller.extend({
	actions : {
		addTodo : function() {
			

			var date = this.get('date');
			var title = this.get('title');
			var body = this.get('body');
			 
			 // creat new todo

			 var newTodo = this.store.createRecord('todo', {

			 	title: title, 
			 	body: body, 
			 	date:  new Date(date)

			 });

			 //save To FB

			 newTodo.save();

			 //clear the form
			 this.setProperties({
			 	title: '', 
			 	body: '', 
			 	date: ''
			 });

			 



		}
	}
});
