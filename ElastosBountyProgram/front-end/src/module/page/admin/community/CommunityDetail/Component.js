import React from 'react'
import { Link } from 'react-router-dom'
import AdminPage from '../../BaseAdmin'
import { Button, Card, Col, Select, Row, Icon, message, Divider, Breadcrumb } from 'antd'
import ModalChangeOrganizerCountry from '../../shared/ModalChangeOrganizerCountry/Component'
import ModalAddSubCommunity from '../../shared/ModalAddSubCommunity/Component'
import ModalUpdateSubCommunity from '../../shared/ModalUpdateSubCommunity/Component'
import ModalAddOrganizer from '../../shared/ModalAddOrganizer/Component'
import Navigator from '../../shared/Navigator/Component'
import config from '@/config'
import { COMMUNITY_TYPE } from '@/constant'

import '../style.scss'

export default class extends AdminPage {
    state = {
        visibleModalChangeOrganizer: false,
        visibleModalAddSubCommunity: false,
        visibleModalUpdateSubCommunity: false,
        visibleModalAddOrganizer: false,
        communityType: null,
        listSubCommunitiesByType: null,
        showAllSubCommunity: {
            [COMMUNITY_TYPE.STATE]: false,
            [COMMUNITY_TYPE.CITY]: false,
            [COMMUNITY_TYPE.REGION]: false,
            [COMMUNITY_TYPE.SCHOOL]: false,
        },
        showMoreMinimum: 4,
        breadcrumbRegions: [],
        community: null,
        editedSubCommunity: null,
        editedOrganizer: null,
    }

    // Modal add organizer
    showModalAddOrganizer = () => {
        this.formRefAddOrganizer.props.form.setFieldsValue({
            geolocation: this.props.match.params['country'],
        }, () => {
            this.setState({
                visibleModalAddOrganizer: true,
            })
        })
    }
    handleCancelModalAddOrganizer = () => {
        const form = this.formRefAddOrganizer.props.form
        form.resetFields()

        this.setState({visibleModalAddOrganizer: false})
    }
    handleCreateOrganizer = () => {
        const form = this.formRefAddOrganizer.props.form

        form.validateFields((err, values) => {
            if (err) {
                return
            }

            form.resetFields()
            this.setState({visibleModalAddOrganizer: false})

            const leaderIds = [...this.state.community.leaderIds]
            leaderIds.push(config.data.mockDataLeaderId)
            const communityClone = {
                ...this.state.community,
                leaderIds
            }

            this.props.updateCommunity(communityClone).then(() => {
                message.success('Add new organizer successfully')
                this.loadCommunityDetail()
            }).catch((err) => {
                console.error(err);
                message.error('Error while add organizer')
            })
        })
    }
    saveFormAddOrganizerRef = (formRef) => {
        this.formRefAddOrganizer = formRef
    }

    componentDidMount() {
        this.loadCommunityDetail();
        this.loadSubCommunities();
    }

    loadCommunityDetail() {
        this.props.getCommunityDetail(this.props.match.params['community']).then((community) => {
            // Mock data leader
            community.leaders = []
            community.leaderIds.forEach(() => {
                community.leaders.push(config.data.mockDataAllLeaders[0])
            })
            this.setState({
                community
            })
        });
    }

    loadSubCommunities() {
        this.props.getSubCommunities(this.props.match.params['community']).then((subCommunities) => {
            // Check which communities we will use to render
            const listSubCommunitiesByType = this.getListSubCommunitiesByType(subCommunities, this.props.match.params['region']);
            const breadcrumbRegions = this.getBreadcrumbRegions(subCommunities);

            // Update to state
            this.setState({
                subCommunities,
                listSubCommunitiesByType,
                breadcrumbRegions,
            })
        })
    }

    getBreadcrumbRegions(subCommunities) {
        // Filter communities to get breadcrumb regions
        let breadcrumbRegions = [];
        subCommunities.forEach((community) => {
            breadcrumbRegions.push({
                name: community.name,
            })
        })

        breadcrumbRegions = _.sortBy(_.uniqBy(breadcrumbRegions, 'name'), 'name');

        return breadcrumbRegions;
    }

    // Modal change organizer
    showModalChangeOrganizer = (editedOrganizer) => {
        this.setState({
            editedOrganizer,
            visibleModalChangeOrganizer: true,
        })
    }
    handleCancelModalChangeOrganizer = () => {
        const form = this.formRefChangeOrganizer.props.form
        form.resetFields()

        this.setState({visibleModalChangeOrganizer: false})
    }
    handleChangeOrganizerCountry = () => {
        const form = this.formRefChangeOrganizer.props.form
        form.validateFields((err, values) => {
            if (err) {
                return
            }

            const leaderIds = this.state.community.leaderIds.filter((leaderId) => {
                return leaderId !== this.state.editedOrganizer
            })
            leaderIds.push(config.data.mockDataLeaderId) // Add new org, mock for now

            this.props.updateCommunity({
                ...this.state.community,
                leaderIds,
            }).then(() => {
                form.resetFields()
                this.setState({visibleModalChangeOrganizer: false})
                message.success('Change organizer successfully')

                this.loadCommunityDetail()
            })
        })
    }
    saveFormChangeOrganizerRef = (formRef) => {
        this.formRefChangeOrganizer = formRef
    }

    openChangeOrganizerCountry (leader) {
        this.formRefChangeOrganizer.props.form.setFieldsValue({
            geolocation: this.props.match.params['country'],
            leader: config.data.mockDataAllLeaders[0].id,
        }, this.showModalChangeOrganizer(leader._id))
    }

    handleRemoveCountry = () => {
        alert('TODO confirm spec when click button Remove country')
    }

    // Modal add community
    showModalAddSubCommunity = (type) => {
        this.formRefAddSubCommunity.props.form.setFieldsValue({
            country: this.props.match.params['country'],
        }, () => {
            this.setState({
                visibleModalAddSubCommunity: true,
                communityType: type
            })
        })
    }
    handleCancelModalAddSubCommunity = () => {
        const form = this.formRefAddSubCommunity.props.form
        form.resetFields()

        this.setState({visibleModalAddSubCommunity: false})
    }
    handleAddSubCommunity = () => {
        const form = this.formRefAddSubCommunity.props.form

        form.validateFields((err, values) => {
            if (err) {
                return
            }

            this.proxyCreateSubCommunity(values)
            form.resetFields()
            this.setState({visibleModalAddSubCommunity: false})
        })
    }
    saveFormAddSubCommunityRef = (formRef) => {
        this.formRefAddSubCommunity = formRef
    }

    // Modal update community
    showModalUpdateSubCommunity = (community) => {
        this.setState({
            editedSubCommunity: community
        })

        this.formRefUpdateSubCommunity.props.form.setFieldsValue({
            country: this.props.match.params['country'],
            name: community.name,
            leader: config.data.mockDataAllLeaders[0].id,
        }, () => {
            this.setState({
                visibleModalUpdateSubCommunity: true,
                communityType: community.type
            })
        })
    }
    handleCancelModalUpdateSubCommunity = () => {
        const form = this.formRefUpdateSubCommunity.props.form
        form.resetFields()

        this.setState({visibleModalUpdateSubCommunity: false})
    }
    handleUpdateSubCommunity = () => {
        const form = this.formRefUpdateSubCommunity.props.form

        form.validateFields((err, values) => {
            if (err) {
                return
            }

            this.props.updateCommunity({
                ...this.state.editedSubCommunity,
                name: values['name'],
                leaderId: config.data.mockDataLeaderId
            }).then(() => {
                form.resetFields()
                this.setState({visibleModalUpdateSubCommunity: false})

                message.success('Update community successfully')

                this.loadSubCommunities()
            })
        })
    }
    saveFormUpdateSubCommunityRef = (formRef) => {
        this.formRefUpdateSubCommunity = formRef
    }

    handleShowAllSubCommunity(type) {
        const showAllSubCommunity = this.state.showAllSubCommunity
        showAllSubCommunity[type] = !showAllSubCommunity[type]
        this.setState({
            showAllSubCommunity
        })
    }

    proxyCreateSubCommunity(formValues) {
        this.props.createSubCommunity({
            parentCommunityId: this.props.match.params['community'],
            type: this.state.communityType,
            leaderIds: config.data.mockDataLeaderId, // Mock data
            // TODO check correct value of geolocation
            geolocation: this.props.match.params['country'],
            name: formValues.name,
        }).then(() => {
            message.success('Add new sub community successfully')
            this.loadSubCommunities();
        }).catch(() => {
            message.error('Error while adding new sub community')
        })
    }

    handleChangeCountry(geolocation) {
        if (geolocation) {
            this.props.history.push(`/admin/community/country/${geolocation}`)
        } else {
            this.props.history.push('/admin/community')
        }
    }

    getListSubCommunitiesByType(subCommunities, filterRegionName) {
        let renderCommunities;

        if (filterRegionName) {
            renderCommunities = subCommunities.filter((community) => {
                return community.name === filterRegionName
            })
        } else {
            renderCommunities = subCommunities
        }

        const listSubCommunitiesByType = {
            STATE: [],
            CITY: [],
            REGION: [],
            SCHOOL: [],
        }

        renderCommunities.forEach((community) => {
            // Mock data
            community.leaders = []
            community.leaderIds.forEach((leader) => {
                community.leaders.push(config.data.mockDataAllLeaders[0])
            })
            // Mock data -- end
            listSubCommunitiesByType[community.type] = listSubCommunitiesByType[community.type] || [];
            listSubCommunitiesByType[community.type].push(community);
        })

        return listSubCommunitiesByType;
    }

    handleChangeRegion(region) {
        if (region) {
            const listSubCommunitiesByType = this.getListSubCommunitiesByType(this.state.subCommunities, region);
            this.setState({
                listSubCommunitiesByType
            })
            this.props.history.push(`/admin/community/${this.props.match.params['community']}/country/${this.props.match.params['country']}/region/${region}`);
        } else {
            this.props.history.push(`/admin/community/${this.props.match.params['community']}/country/${this.props.match.params['country']}`);
        }
    }

    ord_renderContent () {
        const listCountriesEl = Object.keys(config.data.mappingCountryCodeToName).map((key, index) => {
            return (
                <Select.Option title={config.data.mappingCountryCodeToName[key]} key={index}
                               value={key}>{config.data.mappingCountryCodeToName[key]}</Select.Option>
            )
        })

        const menuCountriesEl = (
            <Select
                allowClear
                value={this.props.match.params['country'] || undefined}
                showSearch
                style={{width: 160}}
                placeholder="Select a country"
                optionFilterProp="children"
                onChange={this.handleChangeCountry.bind(this)}
            >
                {listCountriesEl}
            </Select>
        )

        const listRegionsEl = this.state.breadcrumbRegions.map((region, index) => {
            return (
                <Select.Option key={index} title={region.name} value={region.name}>{region.name}</Select.Option>
            )
        })

        const menuListRegionsEl = (
            <Select
                allowClear
                value={this.props.match.params['region']}
                showSearch
                style={{width: 160}}
                placeholder="Select a region"
                optionFilterProp="children"
                onChange={this.handleChangeRegion.bind(this)}
            >
                {listRegionsEl}
            </Select>
        )

        return (
            <div className="p_admin_index ebp-wrap">
                <div className="d_box">
                    <div className="p_admin_breadcrumb">
                        <Breadcrumb>
                            <Breadcrumb.Item href="/">
                                <Icon type="home"/>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>Admin</Breadcrumb.Item>
                            <Breadcrumb.Item>
                                <Link to="/admin/community">Community</Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                {menuCountriesEl}
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                {menuListRegionsEl}
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                    <div className="p_admin_content">
                        <Row>
                            <Col span={20}
                                 className="admin-left-column wrap-box-user">
                                <div>
                                    <div className="list-leaders-of-a-country">
                                        {(this.state.community && this.state.listSubCommunitiesByType) ? (
                                            <Row>
                                                <Col span={6}
                                                     className="user-card user-card--without-padding user-card--organizer">
                                                    <h3 className="without-padding overflow-ellipsis" title={this.state.community.name + ' Organizers'}>{this.state.community.name}</h3>
                                                    {this.state.community.leaders.map((leader, index) => {
                                                        return (
                                                            <Card
                                                                key={index}
                                                                hoverable
                                                                onClick={this.openChangeOrganizerCountry.bind(this, leader)}
                                                                cover={<img alt="example" src={leader.avatar}/>}
                                                            >
                                                                <Card.Meta
                                                                    title={leader.name}
                                                                    description={leader.country}
                                                                />
                                                            </Card>
                                                        )
                                                    })}
                                                    <Button className="ant-btn-ebp" type="primary" size="small" onClick={this.showModalAddOrganizer}>Add organizer</Button>
                                                </Col>
                                                <Col span={18} className="wrap-child-box-users">
                                                    {['STATE', 'CITY', 'REGION', 'SCHOOL'].map((communityType, index) => {
                                                        return (
                                                            <div key={index} className="child-box-users">
                                                                <Button className="ant-btn-ebp pull-right" type="primary" size="small" onClick={this.showModalAddSubCommunity.bind(null, COMMUNITY_TYPE[communityType])}>
                                                                    {communityType === 'STATE' && 'Add state'}
                                                                    {communityType === 'CITY' && 'Add city'}
                                                                    {communityType === 'REGION' && 'Add region'}
                                                                    {communityType === 'SCHOOL' && 'Add school'}
                                                                </Button>
                                                                <h3 className="without-padding">
                                                                    {communityType === 'STATE' && 'States / Provinces '}
                                                                    {communityType === 'CITY' && 'Cities '}
                                                                    {communityType === 'REGION' && 'Regions '}
                                                                    {communityType === 'SCHOOL' && 'Schools '}
                                                                    ({this.state.listSubCommunitiesByType[COMMUNITY_TYPE[communityType]].length})
                                                                </h3>
                                                                <Row>
                                                                    {this.state.listSubCommunitiesByType[COMMUNITY_TYPE[communityType]].map((community, i) => {
                                                                        if (!this.state.showAllSubCommunity[COMMUNITY_TYPE[communityType]] && i >= this.state.showMoreMinimum) {
                                                                            return;
                                                                        }

                                                                        return (
                                                                            <Col span={6}
                                                                                 key={i}
                                                                                 className="user-card">
                                                                                {community.leaders.map((leader, index) => {
                                                                                    return (
                                                                                        <Card
                                                                                            key={index}
                                                                                            hoverable
                                                                                            onClick={this.showModalUpdateSubCommunity.bind(null, community)}
                                                                                            cover={<img src={leader.avatar}/>}
                                                                                        >
                                                                                            <Card.Meta
                                                                                                title={leader.name}
                                                                                                description={community.name}
                                                                                            />
                                                                                        </Card>
                                                                                    )
                                                                                })}
                                                                            </Col>
                                                                        );
                                                                    })}
                                                                </Row>

                                                                { this.state.listSubCommunitiesByType[COMMUNITY_TYPE.STATE].length > this.state.showMoreMinimum && (
                                                                    <div onClick={this.handleShowAllSubCommunity.bind(this, COMMUNITY_TYPE.STATE)}>
                                                                        <Divider>
                                                                            { this.state.showAllSubCommunity[COMMUNITY_TYPE.STATE] && (
                                                                                <Button>Collapse <Icon type="up" /></Button>
                                                                            )}
                                                                            { !this.state.showAllSubCommunity[COMMUNITY_TYPE.STATE] && (
                                                                                <Button>Expanse <Icon type="down" /></Button>
                                                                            )}
                                                                        </Divider>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </Col>
                                            </Row>
                                        ) : (<div>Loading</div>)}

                                        <ModalChangeOrganizerCountry
                                            wrappedComponentRef={this.saveFormChangeOrganizerRef}
                                            visible={this.state.visibleModalChangeOrganizer}
                                            onCancel={this.handleCancelModalChangeOrganizer}
                                            onCreate={this.handleChangeOrganizerCountry}
                                            handleRemoveCountry={this.handleRemoveCountry}
                                        />
                                        <ModalAddSubCommunity
                                            communityType={this.state.communityType}
                                            wrappedComponentRef={this.saveFormAddSubCommunityRef}
                                            visible={this.state.visibleModalAddSubCommunity}
                                            onCancel={this.handleCancelModalAddSubCommunity}
                                            onCreate={this.handleAddSubCommunity}
                                        />
                                        <ModalUpdateSubCommunity
                                            communityType={this.state.communityType}
                                            wrappedComponentRef={this.saveFormUpdateSubCommunityRef}
                                            visible={this.state.visibleModalUpdateSubCommunity}
                                            onCancel={this.handleCancelModalUpdateSubCommunity}
                                            onCreate={this.handleUpdateSubCommunity}
                                        />
                                        <ModalAddOrganizer
                                            wrappedComponentRef={this.saveFormAddOrganizerRef}
                                            visible={this.state.visibleModalAddOrganizer}
                                            onCancel={this.handleCancelModalAddOrganizer}
                                            onCreate={this.handleCreateOrganizer}
                                        />
                                    </div>
                                </div>
                            </Col>
                            <Col span={4}
                                 className="admin-right-column wrap-box-navigator">
                                <Navigator selectedItem={'community'}/>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        )
    }
}