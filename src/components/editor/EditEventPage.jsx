import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import printer from '../../utils/printer.js';
import {modifyHash} from 'wwutils';
import C from '../../C';
import Roles from '../../Roles';
import Misc from '../Misc';
import DataStore from '../../plumbing/DataStore';
import ServerIO from '../../plumbing/ServerIO';
import ActionMan from '../../plumbing/ActionMan';
import {getType, getId, nonce} from '../../data/DataClass';
import Ticket from '../../data/charity/Ticket';
import Event from '../../data/charity/Event';
import ListLoad, {CreateButton} from '../ListLoad';

const EditEventPage = () => {
	if ( ! Login.isLoggedIn()) {
		return <div className='alert alert-warning'><h3>Please login</h3></div>;
	}
	// which event?	
	let path = DataStore.getValue(['location','path']);
	let eventId = path[1];
	if (eventId) return <EventEditor id={eventId} />;
	let type = C.TYPES.Event;
	let servlet = path[0];
	return (<div>
		<CreateButton type={type} />
		<h2>Edit an Event</h2>
		<ListLoad type={type} servlet='event' navpage='editEvent' />
	</div>);
};

const EventEditor = ({id}) => {
	let type = C.TYPES.Event;
	let pEvent = ActionMan.getDataItem({type:type, id:id, status:C.KStatus.DRAFT});
	if ( ! pEvent.value) {
		return <Misc.Loading />;
	}
	let item = pEvent.value;

	const addTicketType = () => {
		const tt = Ticket.make({}, item.id);
		item.ticketTypes = (item.ticketTypes || []).concat(tt);
		DataStore.update();
	};

	/**
	 * alter the ticket order 
	 */
	const move = (i, di) => {
		// swap
		let ta = item.ticketTypes[i];
		let tb = item.ticketTypes[i+di];
		assert(ta && tb, "EditEventPage.js - move");
		item.ticketTypes[i] = tb;
		item.ticketTypes[i+di] = ta;
		DataStore.update();
	};

	const path = ['data', type, id];
	return (<div>
		<h2>Event {item.name || id} </h2>		
		<small>ID: {id}</small>
		<Misc.PropControl path={path} prop='name' item={item} label='Event Name' />

		<Misc.PropControl path={['data', type, id]} prop='date' item={item} label='Event Date' type='date' />
		
		<Misc.PropControl path={['data', type, id]} prop='description' item={item} label='Description' type='textarea' />

		<Misc.PropControl path={['data', type, id]} prop='matchedFunding' item={item} label='Matched funding? e.g. 40% for The Kiltwalk' type='number' />
		
		<Misc.PropControl path={['data', type, id]} prop='backgroundImage' item={item} label='Event Page Backdrop' type='imgUpload' />
		
		<Misc.PropControl path={['data', type, id]} prop='logoImage' item={item} label='Square Logo Image' type='imgUpload' />

		<Misc.PropControl path={['data', type, id]} prop='bannerImage' item={item} label='Banner Image' type='imgUpload' />

		<Misc.Card title='Ticket Types' icon='ticket'>
			{item.ticketTypes? item.ticketTypes.map( (tt, i) => 
				<TicketTypeEditor key={'tt'+i} i={i} path={path.concat(['ticketTypes', i])} ticketType={tt} event={item} move={move} last={i + 1 === item.ticketTypes.length} />) 
				: <p>No tickets yet!</p>
			}
			<button onClick={addTicketType}><Misc.Icon glyph='plus' /> Create</button>
		</Misc.Card>

		<Misc.SavePublishDiscard type={type} id={id} />
	</div>);
};

const TicketTypeEditor = ({ticketType, path, event, i, move, last}) => {
	const removeTicketType = () => {
		event.ticketTypes = event.ticketTypes.filter(tt => tt !== ticketType);
		DataStore.update();
	};
	return (<div className='well'>
		<small>{ticketType.id}</small>
		<Misc.PropControl item={ticketType} path={path} prop='name' label='Name' placeholder='e.g. The Wee Wander' />
		<Misc.PropControl item={ticketType} path={path} prop='subtitle' label='SubTitle' placeholder='e.g. a 10 mile gentle walk' />
		<Misc.PropControl item={ticketType} path={path} prop='kind' label='Kind' placeholder='e.g. Adult / Child' />
		<Misc.PropControl type='MonetaryAmount' item={ticketType} path={path} prop='price' label='Price' />
		<Misc.PropControl type='text' item={ticketType} path={path} prop='description' label='Description' />
		<Misc.PropControl type='text' item={ticketType} path={path} prop='attendeeNoun' label='Attendee Noun' placeholder='e.g. Walker' />
		<Misc.PropControl type='img' item={ticketType} path={path} prop='attendeeIcon' label='Attendee Icon' />
		<button disabled={i===0} className='btn btn-default' onClick={() => move(i, -1)}><Misc.Icon glyph='arrow-up' /> up</button>
		<button disabled={last} className='btn btn-default' onClick={() => move(i, 1)}><Misc.Icon glyph='arrow-down' /> down</button>
		<button className='btn btn-danger' onClick={removeTicketType}><Misc.Icon glyph='trash' /></button>
	</div>);
};

export default EditEventPage;
