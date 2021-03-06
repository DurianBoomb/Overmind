import {Overlord} from '../Overlord';
import {OverlordPriority} from '../priorities_overlords';
import {Zerg} from '../../Zerg';
import {DirectiveHaul} from '../../directives/logistics/directive_haul';
import {HaulerSetup} from '../../creepSetup/defaultSetups';
import {Tasks} from '../../tasks/Tasks';
import {isStoreStructure} from '../../declarations/typeGuards';
import {log} from '../../lib/logger/log';
import {Pathing} from '../../pathing/pathing';


export class HaulingOverlord extends Overlord {

	haulers: Zerg[];
	directive: DirectiveHaul;

	constructor(directive: DirectiveHaul, priority = OverlordPriority.ownedRoom.transport) {
		super(directive, 'haul', priority);
		this.directive = directive;
		this.haulers = this.creeps(HaulerSetup.role);
	}

	init() {
		// Spawn a number of haulers sufficient to move all resources within a lifetime, up to a max
		let MAX_HAULERS = 10;
		// Calculate total needed amount of hauling power as (resource amount * trip distance)
		let tripDistance = 2 * Pathing.distance((this.colony.storage || this.colony).pos, this.directive.pos);
		let haulingPowerNeeded = this.directive.totalResources * tripDistance;
		// Calculate amount of hauling each hauler provides in a lifetime
		let haulerCarryParts = _.filter(this.generateProtoCreep(new HaulerSetup()).body, part => part == CARRY).length;
		let haulingPowerPerLifetime = CREEP_LIFE_TIME * haulerCarryParts * CARRY_CAPACITY;
		// Calculate number of haulers
		let numHaulers = Math.min(Math.ceil(haulingPowerNeeded / haulingPowerPerLifetime), MAX_HAULERS);
		// Request the haulers
		this.wishlist(numHaulers, new HaulerSetup());
	}

	private handleHauler(hauler: Zerg) {
		if (_.sum(hauler.carry) == 0) {
			// Travel to directive and collect resources
			if (hauler.inSameRoomAs(this.directive)) {
				// Pick up drops first
				if (this.directive.hasDrops) {
					let allDrops: Resource[] = _.flatten(_.values(this.directive.drops));
					let drop = allDrops[0];
					if (drop) {
						hauler.task = Tasks.pickup(drop);
						return;
					}
				}
				// Withdraw from store structure
				if (this.directive.storeStructure) {
					let store: { [resourceType: string]: number } = {};
					if (isStoreStructure(this.directive.storeStructure)) {
						store = this.directive.storeStructure.store;
					} else {
						store = {'energy': this.directive.storeStructure.energy};
					}
					for (let resourceType in store) {
						if (store[resourceType] > 0) {
							hauler.task = Tasks.withdraw(this.directive.storeStructure, <ResourceConstant>resourceType);
							return;
						}
					}
				}
				// Shouldn't reach here
				log.warning(`${hauler.name} in ${hauler.room.print}: nothing to collect!`);
			} else {
				hauler.task = Tasks.goTo(this.directive);
			}
		} else {
			// Travel to colony room and deposit resources
			if (hauler.inSameRoomAs(this.colony)) {
				// Put energy in storage and minerals in terminal if there is one
				for (let resourceType in hauler.carry) {
					if (hauler.carry[<ResourceConstant>resourceType] == 0) continue;
					if (resourceType == RESOURCE_ENERGY) { // prefer to put energy in storage
						if (this.colony.storage && _.sum(this.colony.storage.store) < STORAGE_CAPACITY) {
							hauler.task = Tasks.transfer(this.colony.storage, resourceType);
							return;
						} else if (this.colony.terminal && _.sum(this.colony.terminal.store) < TERMINAL_CAPACITY) {
							hauler.task = Tasks.transfer(this.colony.terminal, resourceType);
							return;
						}
					} else { // prefer to put minerals in terminal
						if (this.colony.terminal && _.sum(this.colony.terminal.store) < TERMINAL_CAPACITY) {
							hauler.task = Tasks.transfer(this.colony.terminal, <ResourceConstant>resourceType);
							return;
						} else if (this.colony.storage && _.sum(this.colony.storage.store) < STORAGE_CAPACITY) {
							hauler.task = Tasks.transfer(this.colony.storage, <ResourceConstant>resourceType);
							return;
						}
					}
				}
				// Shouldn't reach here
				log.warning(`${hauler.name} in ${hauler.room.print}: nowhere to put resources!`);
			} else {
				hauler.task = Tasks.goToRoom(this.colony.room.name);
			}
		}
	}

	run() {
		for (let hauler of this.haulers) {
			if (hauler.isIdle) {
				this.handleHauler(hauler);
			}
		}
	}
}