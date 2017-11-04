import React from 'react';
import ReactDOM from 'react-dom';

import { Well, Button, Tabs, Tab, Label } from 'react-bootstrap';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import printer from '../utils/printer.js';
import C from '../C';
import DataStore from '../plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';
import { getId, getType } from '../data/DataClass';
import Basket from '../data/Basket';
import { SearchResults } from './SearchPage';
import Roles from '../Roles';
import Misc from './Misc';
import GiftAidForm from './GiftAidForm';
import { LoginWidgetEmbed } from './LoginWidget/LoginWidget';

/**
 * Sign up for an event!
 */
const RegisterPage = () => {
	let eventId = DataStore.getValue('location', 'path')[1];
	const pvEvent = ActionMan.getDataItem({type:C.TYPES.Event, id:eventId});
	if ( ! pvEvent.value) return <Misc.Loading />;
	const event = pvEvent.value;

	const wspath = ['widget', 'RegisterPage', eventId];
	const widgetState = DataStore.getValue(wspath) || {};
	const stagePath = wspath.concat('stage');
	let stage = widgetState.stage;
	if (stage===0) { // start on 1
		stage = 1;
		DataStore.setValue(stagePath, stage, false);
	}

	const pvbasket = ActionMan.getBasketPV();
	const basket = pvbasket.value;
	
	const basketPath = ActionMan.getBasketPath();

	return (
		<div className=''>
			<h2>Register &amp; get tickets for {event.name}</h2>
			
			{basket? <Misc.SavePublishDiscard type={C.TYPES.Basket} id={getId(basket)} hidden /> : null}

			<Tabs activeKey={stage} onSelect={key => DataStore.setValue(stagePath, key)} id='register-stages'>
				<Tab eventKey={1} title='Ticket(s)'>					
					{event.ticketTypes.map((tt,ti) => <RegisterTicket key={ti} event={event} ticketType={tt} basket={basket} />)}
					<NextTab stagePath={stagePath} />
				</Tab>
				<Tab eventKey={2} title='Register'>
					<RegisterOrLoginTab />
					<PreviousTab stagePath={stagePath} /> <NextTab stagePath={stagePath} />
				</Tab>
				<Tab eventKey={3} title='Your Details'>
					<WalkerDetailsTab basket={basket} basketPath={basketPath} />
					<PreviousTab stagePath={stagePath} /> <NextTab stagePath={stagePath} />
				</Tab>
				<Tab eventKey={4} title='Your Charity'>					
					<CharityChoiceTab basket={basket} />
					<PreviousTab stagePath={stagePath} /> <NextTab stagePath={stagePath} />
				</Tab>
				<Tab eventKey={5} title='Checkout'>					
					<PreviousTab stagePath={stagePath} />
				</Tab>
				<Tab eventKey={6} title='Confirmation'>	
					ticket list, receipt, print button
					CTA(s) to go to your shiny new fundraising page(s)
				</Tab>
			</Tabs>
		</div>
	);
};

const NextTab = ({stagePath}) => {
	return (<button onClick={() => {
		let n = DataStore.getValue(stagePath) + 1;
		DataStore.setValue(stagePath, n);
	}} >Next</button>);
};
const PreviousTab = ({stagePath}) => {
	return (<button onClick={() => {
		let n = DataStore.getValue(stagePath) - 1;
		DataStore.setValue(stagePath, n);
	}} >Previous</button>);
};

const RegisterTicket = ({event,ticketType,basket}) => {
	// TODO put cloned objects into the basket, so we can extra details to them (names & addresses) on a per-ticket basis	
	let tickets = basket? Basket.getItems(basket).filter(tkt => getId(tkt) === getId(ticketType)) : [];
	return (<div>		
		<button onClick={() => ActionMan.addToBasket(basket, ticketType)} disabled={ ! basket }>
			{ticketType.name} <Misc.Money amount={ticketType.price} />
		</button>
		{tickets.length? 
			<div>{tickets.length} <button title='Cancel a ticket' onClick={() => ActionMan.removeFromBasket(basket, tickets[tickets.length-1])} >
				<Misc.Icon glyph='minus' />
			</button></div> 
			: null}
	</div>);
};

const RegisterOrLoginTab = () => {
	if (Login.isLoggedIn()) {
		return (
			<div>
				<Misc.Icon glyph='tick' className='text-success' />
				<p>You're logged in as <Label title={Login.getId()}>{Login.getUser().name || Login.getId()}</Label>.</p>
				<p>Not you? <Button bsSize='small' onClick={() => Login.logout()}>Log out</Button></p>
				
			</div>
		);
	}
	return (
		<div>
			<p>Please login or register your account.</p>
			<LoginWidgetEmbed services={['twitter']} />
		</div>
	);
};


const WalkerDetailsTab = ({basket, basketPath}) => {
	if ( ! basket) return null;
	assert(basketPath);
	// Sort all tickets in basket & list in format:
	// Ticket Type A
	// - Attendee 1
	// - Attendee 2
	// Ticket Type B
	// - Attendee 1
	let items = Basket.getItems(basket).sort((a, b) => a.name > b.name);
	let wdetails = items.map((ticket, ti, tickets) => {
		const ticketPath = [...basketPath, 'items', ti];

		const prevTicket = (ti === 0) ? null : tickets[ti-1];
		if (!prevTicket || prevTicket.id !== ticket.id) {
			ticket.number = 1;
		} else if (prevTicket && prevTicket.number && prevTicket.id === ticket.id) {
			ticket.number = prevTicket.number + 1;
		}
		const header = (ticket.number === 1) ? (
			<h3>{ticket.name}</h3>
		) : null;

		return (
			<div key={ti}>
				{header}
				<AttendeeDetails ticket={ticket} i={ti} path={ticketPath} />
			</div>
		);
	});
	return <div>{wdetails}</div>;
};

const AttendeeDetails = ({i, ticket, path}) => {
	const noun = ticket.attendeeNoun || 'Attendee';
	const sameAddressAsFirst = i > 0 ? (
		<Misc.PropControl type='checkbox' path={path} prop='sameAsFirst' label='Same address as first walker' />
	) : null;

	const isSame = DataStore.getValue([...path, 'sameAsFirst']);

	const address = isSame ? null : (
		<Misc.PropControl type='text' path={path} prop='attendeeAddress' label='Address' />
	);

	return (
		<Well>
			<h4>{noun} <span>{i+1}</span></h4>
			<Misc.PropControl type='text' path={path} prop='attendeeName' label={`${noun} Name`} />
			<Misc.PropControl type='text' path={path} prop='attendeeEmail' label='Email' />
			{ sameAddressAsFirst }
			{ address }
		</Well>
	);
};

const CharityChoiceTab = ({basket}) => {
	if ( ! basket) return null;
	// const pvCharities = DataStore.fetch([], () => {
	// 		ServerIO.search({q: query, from, size: RESULTS_PER_PAGE, status, recommended})
	// 		.then(function(res) {
	// 		})
	// 	}
	// );
		// results={charities} total={total} from={from} query={q} 
		// all={this.state.all} recommended={recommended}

	return (<div>
		<p>Please choose a charity to support.</p>		
		<Misc.PropControl path={['data',C.TYPES.Basket, getId(basket)]} prop='charity' label='My Charity' />

		Let's reuse SearchResults 

		show some recommended charities
	</div>);
};

export default RegisterPage;
