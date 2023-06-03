import get from 'lodash/get';

import $axios from '~/services/AxiosService';

export class ResourcePermission {
  /**
   *
   * @param {Object} params
   * @param {Object} params.permissions
   * @param {String} params.resourceId
   * @param {'quiz' | 'report' | 'collection'} params.resourceType
   * @param {String} params.creatorId
   */
  constructor(params) {
    this.id = params.resourceId;
    this.type = params.resourceType;
    this.orgPermissions = params.permissions.org;
    this.userPermissions = params.permissions.users;
    this.orgUsersPermissions = params.permissions.orgUsers;
    this.isPublic = params.permissions.public;
    this.invitedUsers = params.permissions.invited;
    this.creatorId = params.creatorId;
  }

  /**
   * Checks if a user is permitted to perform a particular type of action
   *
   * @param {Object} user
   * @param {'READ' | 'WRITE' | 'SHARE' | 'SUPER'} permission The permission the user should have
   * @returns {boolean}
   */
  isUserPermittedFor(user, permission) {
    const userId = user.id;
    const userOrganizationId = user.paidOrganization;

    if (this.isCreatedBy(userId)) {
      return true;
    }

    if (this.isOrgPermittedFor(userOrganizationId, permission)) {
      return true;
    }

    if (this.isUserOrgPermittedFor(userId, userOrganizationId, permission)) {
      return true;
    }

    const userEntry = get(this.userPermissions, userId, null);
    if (!userEntry) {
      return false;
    }

    const userPerms = userEntry.permissions;

    if (!userPerms || !userPerms.includes(permission)) {
      return false;
    }

    return true;
  }

  /**
   * Checks if an organization is permitted to perform a particular type of action
   *
   * @param {String} orgId The ID of the organization to check
   * @param {'READ' | 'WRITE' | 'SHARE' | 'SUPER'} permission The permission that the organization should have
   * @returns {boolean}
   */
  isOrgPermittedFor(orgId, permission) {
    const accessorId = `${orgId}/instructor`;

    const orgPerms = get(this.orgPermissions, accessorId, null);

    if (!orgPerms || !orgPerms.includes(permission)) {
      return false;
    }

    return true;
  }

  isUserOrgPermittedFor(userId, paidOrgId, permission) {
    const accessorId = `${userId}:${paidOrgId}`;

    if (this.orgUsersPermissions && this.orgUsersPermissions.length) {
      const orgUserPermission = this.orgUsersPermissions.find((pem) => pem.accessorId === accessorId);
      if (orgUserPermission && orgUserPermission.permissionsList.includes(permission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks if this resource has been created by the given userId
   *
   * @param {String} userId
   * @returns {boolean}
   */
  isCreatedBy(userId) {
    return (this.creatorId === userId);
  }

  /**
   * Checks if any accessors have been permitted for the given action
   *
   * @param {'READ' | 'WRITE' | 'SHARE' | 'SUPER'} permission The permission the user should have
   * @returns {boolean}
   */
  isAnybodyPermittedFor(permission) {
    return (this.areAnyUsersPermittedFor(permission) || this.areAnyOrgsPermittedFor(permission));
  }

  /**
   * Checks if any users have been permitted for the given action
   *
   * @param {'READ' | 'WRITE' | 'SHARE' | 'SUPER'} permission The permission the user should have
   * @returns {boolean}
   */
  areAnyUsersPermittedFor(permission) {
    let found = false;

    for (let i = 0; i < this.userPermissions.length; i++) {
      if (this.userPermissions[i].permissions.includes(permission)) {
        found = true;
        break;
      }
    }

    return found;
  }

  /**
   * Checks if any organizations have been permitted for the given action
   *
   * @param {'READ' | 'WRITE' | 'SHARE' | 'SUPER'} permission The permission the user should have
   * @returns {boolean}
   */
  areAnyOrgsPermittedFor(permission) {
    let found = false;

    const orgIds = Object.keys(this.orgPermissions);

    for (let i = 0; i < orgIds.length; i++) {
      const orgId = orgIds[i];
      if (this.orgPermissions[orgId].permissions.includes(permission)) {
        found = true;
        break;
      }
    }

    return found;
  }
}

export default class ResourcePermissionService {
  /**
   * Fetches the permissions object for a resource and returns it in a consumable form
   *
   * @param {Object} resourceData
   * @param {String} resourceData.id ID of the resource
   * @param {String} resourceData.creatorId ID of the resource creator
   * @param {'quiz' | 'report' | 'collection'} resourceData.type Type of the resource
   *
   * @returns {Promise<ResourcePermission()>}
   */
  static async getPermissions(resourceData) {
    const { id, creatorId, type } = resourceData;
    try {
      const response = await $axios().post('/resource-permissions/list', {
        resource: {
          id,
          type,
        },
      });

      const result = response.data;

      if (result.success) {
        const permissions = new ResourcePermission({
          permissions: result.data.permissions,
          resourceId: id,
          resourceType: type,
          creatorId,
        });
        return permissions;
      }

      return null;
    } catch (err) {
      return null;
    }
  }

  /**
   *
   * Request access for the resource
   *
   * @param {Object} payload
   * @param {String} payload.id the id of the resource
   * @param {String} payload.type the type of the resource
   */
  static async requestAccess(payload) {
    try {
      const { id, type } = payload;

      const response = await $axios().post('/resource-permissions/request-access', {
        resource: {
          id,
          type,
        },
      });

      return { success: true, response };
    } catch (error) {
      return { success: false, error };
    }
  }

  static async resolveAccessRequest(payload) {
    try {
      const { id, type } = payload;

      const response = await $axios().delete(`/resource-permissions/access-request/${type}/${id}`);

      return {
        success: true,
        response: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  static async revokeOwnPermissions(payload) {
    try {
      const { id, type } = payload;
      const response = await $axios().delete(`/resource-permissions/${type}/${id}`);

      return {
        success: true,
        response: response.data,
      };
    } catch (err) {
      return {
        success: false,
        error: err,
      };
    }
  }
}
