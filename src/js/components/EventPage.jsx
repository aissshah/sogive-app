import React from 'react';
import ReactDOM from 'react-dom';

import MDText from '../base/components/MDText'

import SJTest, {assert} from 'sjtest';
import { modifyHash, encURI, uid } from 'wwutils';
import { Button, Well } from 'react-bootstrap';

import printer from '../base/utils/printer.js';
import C from '../C';
import Roles from '../base/Roles';
import Misc from '../base/components/Misc';
import DataStore from '../base/plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';
import {getType, getId, nonce} from '../base/data/DataClass';
import ListLoad, {CreateButton} from '../base/components/ListLoad';
import FundRaiser from '../data/charity/FundRaiser';
import Money from '../base/data/Money';

const EventPage = () => {
	// which event?	
	let path = DataStore.getValue(['location','path']);
	let eventId = path[1];
	if (eventId) {
		return <Event id={eventId} />;
	}
	// list
	let type = C.TYPES.Event;
	let pvCanEdit = Roles.iCan(C.CAN.editEvent);
	return (
		<div>
			<h2>Pick an Event</h2>
			<ListLoad type={type} status={C.KStatus.PUBLISHED} />
			{pvCanEdit.value? <div><h4>Draft Events</h4>
				<ListLoad type={type} status={C.KStatus.DRAFT} />
				<CreateButton type={type} />
			</div> 
				: null}
		</div>
	);
};

const Event = ({id}) => {
	let type = C.TYPES.Event;
	let pEvent = ActionMan.getDataItem({type:type, id:id, status:C.KStatus.DRAFT});

	if ( ! pEvent.value) {
		return <Misc.Loading />;
	}
	let item = pEvent.value;
	let logo = item.logoImage || item.img;
	let canEdit = Roles.iCan(C.CAN.editEvent).value;
	let pstyle = {backgroundImage: item.backgroundImage? 'url('+item.backgroundImage+')' : null};	
	let allFundraisers = Object.values(DataStore.getValue(['data',C.TYPES.FundRaiser]) || {});
	let ourFundraisers = allFundraisers.filter(f => FundRaiser.eventId(f)===id && FundRaiser.status(f)===C.TYPES.PUBLISHED);
	let total = Money.total(ourFundraisers.map(FundRaiser.donated));

	return (<>
		<div className='fullwidth-bg' style={pstyle} />
		<div className="col-md-8 col-md-offset-2 well" style={{marginTop:'2vh'}}>
			{item.bannerImage? <img src={item.bannerImage} style={{width:'100%', maxHeight:'50vh'}} alt='event banner' /> : null}
			<h2>{item.name || 'Event '+id}</h2>		
			<small>SoGive ID: {id}</small>
			{logo? <img src={logo} className='pull-right logo-xlarge img-thumbnail' alt='event logo' /> : null}
			<center>
				{item.date? <Misc.LongDate date={item.date} /> : null}
				{item.description? <MDText source={item.description} /> : null}				
				{item.url? <div><a href={item.url}>Event website</a></div> : null}
			</center>

			<Register event={item} />
	
			{item.backgroundImage? <img src={item.backgroundImage} className='img-thumbnail' width='200px' /> : null}

			{canEdit? <div className='pull-right'><small><a href={modifyHash(['editEvent',id], null, true)}>edit</a></small></div> : null}

			<div>
				<h3>Participants and FundRaising Pages</h3>
				{total? <Misc.Money amount={total} /> : null}
				<FundRaiserList eventId={id} />
			</div>
		</div>
	</>);
};


const FundRaiserList = ({eventId}) => {
	let q = "eventId:"+eventId;
	let sort = null;
	// let ListItem = 
	return (<ListLoad type={C.TYPES.FundRaiser} status={C.KStatus.PUBLISHED} q={q}
		hasFilter={false}		
		checkboxes={false} canDelete={false} canCreate={false}
	/>);
};


const Register = ({event}) => {
	assert(event);
	// published?
	if (false && event.status !== C.KStatus.PUBLISHED) {
		return (<center><a title='This is a draft - you can only register from the published event page' className='btn btn-lg btn-primary disabled'>Register</a></center>);	
	}
	// just a big CTA
	return (<center><a href={'#register/'+getId(event)} className='btn btn-lg btn-primary'>Register</a></center>);
};


export default EventPage;
